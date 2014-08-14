var events = require('events');
var util = require('util');
var format = require('util').format;

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var http = require('http');
var moment = require('moment');
var request = require('request');
var url = require('url');

var Log = require('log');
var log = null;

// Roboto depedencies
var defaultDownloader = require('./downloaders/default')();
var itemLogger = require('./pipelines/item-logger');

/* Log level reference
0 EMERGENCY system unusable
1 ALERT immediate action required
2 CRITICAL condition critical
3 ERROR condition error
4 WARNING condition warning
5 NOTICE condition normal, but significant
6 INFO a purely informational message
7 DEBUG debugging information
*/

var defaultStats = {
  startTime: moment(),
  finishTime: null,
  pagesCrawled: 0,
  nofollowed: 0,
  download: {
    requestCount: 0,
    requestErrors: 0,
    status200: 0,
    status301: 0,
    status302: 0,
    status404: 0,
    disallowedDomain: 0,
    blacklisted: 0,
  }
};

var cheerioOptions = {
  normalizeWhitespace: true
};

function Crawler(options) {
  // Merge opts with defaults
  this.options = _.extend({
    userAgent:      "roboto/" + exports.VERSION,
    logLevel: 'info',
  }, options);

  // Expose useful things
  this.defaultRequestOptions = {
    method: 'GET',
    headers: {
        'User-Agent': this.options.userAgent
    },
  }
  this.log = log = new Log(this.options.logLevel);

  this.stats = defaultStats;
  this._queue = [];
  this._seen = [];

  this._fieldParsers = {};
  this._pipelines = [ itemLogger({log: log}) ];
  this._downloader = defaultDownloader;

  events.EventEmitter.call(this);
};

// Mixin EventEmitter
util.inherits(Crawler, events.EventEmitter);

Crawler.prototype.parseField = function(name, parser) {
  this._fieldParsers[name] = parser;
};

Crawler.prototype.pipeline = function(pipelineFn) {
  this._pipelines.push(pipelineFn);
};

Crawler.prototype.crawl = function() {
  this._queue = this.options.startUrls;
  this.emit('start');

  var self = this;
  async.until(
    self._emptyQueue.bind(self),  // test
    self._crawlNext.bind(self),   // run this while test is true
    function (err) {              // do this when its all done
      if (err) {
        this.log.critical('Encountered critical error: %s', err);
      }
      self.emit('finish');
    }
  );

};

Crawler.prototype._emptyQueue = function() {
  return this._queue.length === 0;
};

Crawler.prototype._crawlNext = function(done) {
  var nextUrl = this._queue.shift();
  this._currentUrl = nextUrl;
  this.emit('next', nextUrl);

  async.waterfall([
    this._download(nextUrl).bind(this),
    this._parse.bind(this),
    this._process.bind(this),
  ], function(err) {
    if (err) this.log.error('Ecountered error: %s', err);
    done();
  });
};

// This provides an extensibility point. To override the 
// downloading behavior of roboto, register a custom downloader
// with this function.
// A downloader is simply a function that:
//    - takes an href as a parameter
//    - makes a request
//    - invokes a handler with the signature fn(err, response, body)
// For more info: https://github.com/cgiffard/node-simplecrawler/blob/master/test/testcrawl.js
//
Crawler.prototype.downloader = function(downloader) {
  this._downloader = downloader;
}

// fetch next page using downloader middleware
Crawler.prototype._download = function(href) {
  return function(done) {
    this.stats.download.requestCount += 1;
    this.emit('download', href);

    var handler = function(err, response, body) {
      // handle network/dns/request errors
      if (err) {
        this.log.error('Encountered the following error while requesting <%s>: %s', href, err);
        this.stats.requestErrors += 1;
        done();
        return;
      }

      var statusCode = response.statusCode;
      if (statusCode >= 400) {
        if (statusCode == 404) { this.stats.download.status404 += 1; }
        this.log.error('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
        done(); 
        return;
      }
      else if (statusCode === 302) { this.stats.download.status302 += 1; }
      else if (statusCode === 301) { this.stats.download.status301 += 1; }
      else if (statusCode > 200) {
        this.log.info('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
      }
      else {
        this.stats.download.status200 += 1;
      }

      var res = _.extend(response, { url: href });
      res.$ = cheerio.load(body, cheerioOptions);

      done(null, res);
    };

    this._downloader(href, handler.bind(this));
  }
};

// Parse an item and a list of links from the response.
Crawler.prototype._parse = function(response, done) {
  // Don't attempt to parse empty responses
  if (_.isFunction(arguments[0])) {
    arguments[0]();
    return;
  }
  this.emit('parse', response);

  // Run all field parsers
  $ = response.$;
  var item = {};
  _.each(this._fieldParsers, function(parser, fieldName) {
    item[fieldName] = parser(response, $);
  });

  // Check if the meta tags of a page specify nofollow
  var robotsMeta = $('meta[name="robots"]').attr('content');
  if (robotsMeta && robotsMeta.indexOf('nofollow') > -1) {
    this.emit('nofollow', '"nofollow" found in meta tag: %s', response.url);
    done(null, item, []);
    return;
  }

  // Extract and normalize links
  var self = this;
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
    this.stats.download.disallowedDomain += 1;
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
      this.stats.download.blacklisted += 1;
    }
  }, this);

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
      this.log.debug('Filtering offsite request: %s', href);
    }

    return allowedDomain;
};

// Normalize (canonicalize) the url.
// - Discards query params
// - Converts relative urls to absolute
// - Removes redundant slashes
Crawler.prototype._normalizeUrl = function(link, response) {
  var href = link.attr('href');

  // Split the link and the response url into parts
  var hrefInfo = url.parse(href, true, true);
  var requestInfo = url.parse(response.url, true, true);

  // Then reconstitue a proper url
  var returnUrl = url.format({
    protocol: hrefInfo.protocol || requestInfo.protocol,
    host: hrefInfo.host || requestInfo.host,
    pathname: url.resolve(requestInfo.pathname, (hrefInfo.pathname || ''))
  });

  return returnUrl;
};

Crawler.prototype._process = function(item, links, done) {
  if (_.isFunction(arguments[0])) {
    arguments[0]();
    return;
  }
  if (item) { this.emit('item', item); }
  if (links) { this.emit('links', links); }
  done();
};

Crawler.prototype.on('finish', function() {
  var now = moment();
  var hours = now.diff(this.stats.startTime, 'hours');
  var mins = now.diff(this.stats.startTime, 'minutes');
  var secs = now.diff(this.stats.startTime, 'seconds');
  var prettyFormat = "dddd, MMMM Do YYYY, h:mm:ss a";

  this.log.info('Finished crawled.');
  this.log.info('  >> Started: %s ', this.stats.startTime.format(prettyFormat));
  this.log.info('  >> Finished: %s ', now.format(prettyFormat));
  this.log.info('  >> Duration: %s hours, %s minutes, %s seconds.', hours, mins, secs);
  this.log.info('  >> Page(s) crawled: %s', this.stats.pagesCrawled);
  this.log.info('  >> Page(s) nofollowed: %s', this.stats.nofollowed);
  this.log.info('  >> Request count: %s', this.stats.download.requestCount);
  this.log.info('  >> Request errors: %s', this.stats.download.requestErrors);
  this.log.info('  >> 200 OK count : %s', this.stats.download.status200);
  this.log.info('  >> 301 count : %s', this.stats.download.status301);
  this.log.info('  >> 302 count : %s', this.stats.download.status302);
  this.log.info('  >> 404 count : %s', this.stats.download.status404);
  this.log.info('  >> Filtered due to');
  this.log.info('    >> Disallowed domain: %s', this.stats.download.disallowedDomain);
  this.log.info('    >> Blacklist: %s', this.stats.download.blacklisted);
});

// Run all pipelines
Crawler.prototype.on('item', function(item) {
  debugger;
  // A page isn't counted as crawled unless is creates an item.
  this.stats.pagesCrawled += 1;

  _.each(this._pipelines, function(pipelineFn) {
    pipelineFn.call(this, item);
  }, this);
});

// Default link handling
Crawler.prototype.on('links', function(links) {
  this.log.debug('Extracted %s links: %s', links.length, JSON.stringify(links, null, '  >> '));

  _.each(links, function(link) {
    if(!_.contains(this._seen, link)) {
      this._queue.push(link);
      this._seen.push(link);
    }
    else {
      this.log.debug('Filtering previously seen url: %s', link);
    }
  }, this);

});

Crawler.prototype.on('start', function(href) {
  this.log.info('Beginning Crawl.');
});

Crawler.prototype.on('next', function(href) {
  this.log.info('Crawling %s', href);
});

Crawler.prototype.on('nofollow', function(reason) {
  this.stats.nofollowed += 1;
  this.log.warning(reason);
});

exports = module.exports = Crawler;
