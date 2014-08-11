var events = require('events');
var util = require('util');

var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var format = require('util').format;
var url = require('url');
var _ = require('underscore');

var Log = require('log');
//var log = new Log('debug');
var log = new Log('info');

/*
0 EMERGENCY system unusable
1 ALERT immediate action required
2 CRITICAL condition critical
3 ERROR condition error
4 WARNING condition warning
5 NOTICE condition normal, but significant
6 INFO a purely informational message
7 DEBUG debugging information
*/

function Crawler(options) {
  this.options = options;
  this.crawlStats = { pagesCrawled: 0, errors: 0 };
  this._queue = [];
  this._seen = [];

  this._fieldParsers = {};

  events.EventEmitter.call(this);
};

// Mixin EventEmitter
util.inherits(Crawler, events.EventEmitter);

Crawler.prototype.parseField = function(name, parser) {
  this._fieldParsers[name] = parser;
};

Crawler.prototype.crawl = function() {
  this._queue = this.options.startUrls;
  this.emit('begin');

  async.until(
    this._emptyQueue.bind(this),
    this._crawlNext.bind(this),
    this._finished.bind(this)
  );
};

Crawler.prototype._emptyQueue = function() {
  return this._queue.length === 0;
};

Crawler.prototype._crawlNext = function(done) {
  var nextUrl = this._queue.shift();
  this.emit('next', nextUrl);

  async.waterfall([
    this._download(nextUrl).bind(this),
    this._parse.bind(this),
    this._process.bind(this),
  ], function(err) {
    if (err) log.error('Ecountered error: %s', err);
    done();
  });
};

// fetch next page using downloader middleware
Crawler.prototype._download = function(href) {
  return function(done) {
    this.emit('beginDownload', href);

    // This should be over-rideable
    var requestOptions = {
      url: href,
      method: 'GET',
    }

    if(this.options.httpAuth) {
      requestOptions.auth = this.options.httpAuth;
    }

    var requestHandler = function requestHandler(err, response, body) {
      var res = {};
      res.url = href;
      res.httpVersion = response.httpVersion;
      res.headers = response.headers;
      res.method = response.method;
      res.statusCode = response.statusCode;
      res.body = body;

      var htmlParserOpts = {
        normalizeWhitespace: true
      };
      res.$ = cheerio.load(body, htmlParserOpts);

      done(err, res);
    }

    request(requestOptions, requestHandler);
  }
};

// Parse an item and a list of links from the response.
Crawler.prototype._parse = function(response, done) {
  var self = this;
  $ = response.$;

  this.emit('beginParse', response);

  var item = {};
  // Run all field parsers
  _.each(this._fieldParsers, function(parser, fieldName) {
    item[fieldName] = parser(response, $);
  });

  // Check if the meta tags of a page specify nofollow
  var robotsMeta = $('meta[name="robots"]').attr('content');
  if (robotsMeta && robotsMeta.indexOf('nofollow') > -1) {
    this.emit('nofollow', '"nofollow" found in meta tag: %s', response.url);
    done(null, item, []);
  }

  // Extract and normalize links
  var links = [];
  $('a').each(function() {
    var link = $(this);
    if ( self._followable(link) ) {
      var normalizedUrl = self._normalizeUrl(link, response);

      if ( self._allowedUrl(normalizedUrl) ) {
        links.push(normalizedUrl);
      }
    }
  });

  done(null, item, links);
};

// Determine if the link can be followed. Links
// without href attributes, or links that have nofollow
// directives should return false.
Crawler.prototype._followable = function(link) {
  var href = link.attr('href');
  var rel = link.attr('rel');

  // Can't follow links without href attributes
  if (!href) {
    this.emit('nofollow', 'No href found in ' + link);
    return false;
  }

  // Respect nofollow rules
  if (rel && rel.indexOf('nofollow') > -1) {
    this.emit('nofollow', 'Link has "rel=nofollow" ' + link);
    return false;
  }

  return true;
};

// Determine if the link is allowed by the crawler.
// Checks against the whitelist, blacklist, and asserts
// that the domain of the url is in the allowed domains configured
// for the crawler.
//
// Expects an absolute canonicalized url.
Crawler.prototype._allowedUrl = function(href) {

  // Check against allowedDomains
  if(!this._allowedDomain(href)){
    return false;
  }

  return this._whitelist(href) && this._blacklist(href);
};

Crawler.prototype._whitelist = function(href) {
  if(!this.options.whitelist) return true;

  var allowed = false;
  _.each(this.options.whitelist, function(rule) {
    if (href.match(rule)){
      allowed = true;
    }
  });

  return allowed;
};

Crawler.prototype._blacklist = function(href) {
  if(!this.options.blacklist) return true;

  var allowed = true;
  _.each(this.options.blacklist, function(rule) {
    if (href.match(rule)){
      allowed = false;
    }
  });

  return allowed;
};

Crawler.prototype._allowedDomain = function(href) {
    if(!this.options.allowedDomains) return true;

    var allowedDomain = false;
    _.each(this.options.allowedDomains, function(allowed) {
      var host = url.parse(href).hostname;

      // If a host cant be parsed from the url, disallow.
      if(!host) return false;

      if(host.indexOf(allowed) > -1) {
        allowedDomain = true;
      }
    });

    if(!allowedDomain) {
      log.debug('Filtering offsite request: %s', href);
    }

    return allowedDomain;
};

// Normalize (canonicalize) the url.
// - Discards query params
// - Converts relative urls to absolute
// - Removes redundant slashes
Crawler.prototype._normalizeUrl = function(link, response) {
  var href = link.attr('href');

  var hrefInfo = url.parse(href, true, true);
  var requestInfo = url.parse(response.url, true, true);

  var returnUrl = url.format({
    protocol: hrefInfo.protocol || requestInfo.protocol,
    host: hrefInfo.host || requestInfo.host,
    pathname: url.resolve(requestInfo.pathname, (hrefInfo.pathname || ''))
  });

  return returnUrl;
};

Crawler.prototype._process = function(item, links, done) {
  this.emit('item', item);
  this.emit('links', links);
  done();
};

Crawler.prototype._finished = function(err) {
  log.info('Finished crawl.');
  log.info('  >> %s page(s) crawled.', this.crawlStats.pagesCrawled);
};

// Default item handling
Crawler.prototype.on('item', function(item) {
  log.info('Parsed item:');
  log.info(JSON.stringify(item, null, '  '));
});

// Default link handling
Crawler.prototype.on('links', function(links) {
  log.debug('Extracted %s links: %s', links.length, JSON.stringify(links, null, '  >> '));

  _.each(links, function(link) {
    if(!_.contains(this._seen, link)) {
      this._queue.push(link);
      this._seen.push(link);
    }
    else {
      log.debug('Filtering previously seen url: %s', link);
    }
  }, this);

});

Crawler.prototype.on('begin', function(href) {
  log.info('Beginning Crawl.');
});

Crawler.prototype.on('next', function(href) {
  log.info('Crawling %s', href);
  this.crawlStats.pagesCrawled += 1;
});

Crawler.prototype.on('nofollow', function(reason) {
  log.warning(reason);
});

exports = module.exports = Crawler;
