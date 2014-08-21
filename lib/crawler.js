var util = require('util');
var format = require('util').format;
var EE = require("events").EventEmitter;

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

var BotParser = require('./robotsParser');

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

var defaultStats = function() {
  var stats = {
    startTime: moment(),
    finishTime: null,
    pagesCrawled: 0,
    nofollowed: 0,
  }
  stats.download = {
    requestCount: 0,
    requestErrors: 0,
    status200: 0,
    status301: 0,
    status302: 0,
    status404: 0,
    disallowedDomain: 0,
    blacklisted: 0,
  }
  return stats;
};

var cheerioOptions = {
  normalizeWhitespace: true
};

var Crawler = function(options) {
  // Merge opts with defaults
  this.options = _.extend({
    userAgent: "roboto",
    logLevel: 'info',
    requestDelay: 0,
    obeyRobotsTxt: true,
  }, options);

  // Initialize log
  this.log = log = new Log(this.options.logLevel);

  // Initialize the robots.txt parser
  this.botParser = new BotParser({ 
    userAgent: this.options.userAgent,
    log: this.log
  });

  // Expose useful things
  this.defaultRequestOptions = {
    method: 'GET',
    timeout: this.options.requestTimeout,
    headers: {
        'User-Agent': this.options.userAgent
    },
  }

  this.stats = defaultStats();
  this._queue = [];
  this._seen = [];

  this._fieldParsers = {};
  this._pipelines = [ itemLogger({log: log}) ];
  this._downloader = defaultDownloader;

  this.on('start', function(href) {
    this.log.info('Beginning Crawl.');
  });

  this.on('next', function(href) {
    this.log.info('Crawling %s', href);
  });

  EE.call(this);
};

// Mixin EventEmitter
util.inherits(Crawler, EE);

Crawler.prototype.parseField = function(name, parser) {
  this._fieldParsers[name] = parser;
};

Crawler.prototype.pipeline = function(pipelineFn) {
  this._pipelines.push(pipelineFn);
};

//Crawler.prototype.crawl = function(done) {
Crawler.prototype.crawl = function() {
  this._queue = this.options.startUrls;
  this.emit('start');

  var self = this;
  async.until(
    self._emptyQueue.bind(self),  // test
    self._crawlNext.bind(self),   // run this while test is true
    self._finish.bind(self)       // do this when its all done
  );

};

Crawler.prototype._emptyQueue = function() {
  return this._queue.length === 0;
};

Crawler.prototype._getNextUrl = function() {
  return this._queue.shift();
};

Crawler.prototype._addUrl= function(href) {
  if(!_.contains(this._seen, href)) {
    this._queue.push(href);
    this._seen.push(href);
  }
  else {
    this.log.debug('Filtering previously seen href: %s', href);
  }
};

Crawler.prototype._crawlNext = function(done) {
  var self = this;
  var nextUrl = self._getNextUrl();
  self.emit('next', nextUrl);

  self.botParser.crawlDelay(nextUrl, function(robotsDelay) {
    var delay = (self.options.obeyRobotsTxt && robotsDelay) || self.options.requestDelay;
    self._crawlAfterDelay(delay, nextUrl, done);
  });
};

Crawler.prototype._crawlAfterDelay = function(delay, href, done) {
    setTimeout(this._crawlPage.bind(this), delay, href, done);
};

Crawler.prototype._crawlPage = function(url, done) {
  var self = this;
  var obeyRobotsTxt = this.options.obeyRobotsTxt;

  // Filter out links disallowed by robots.txt
  this.botParser.allowed(url, function(allowed) {
    if (allowed) {
      // Check the robots file here
      async.waterfall([
        self._download(url).bind(self),
        self._parse.bind(self),
        self._process.bind(self),
      ], function(err) {
        if (err) this.log.error('Ecountered error: %s', err);
        done();
      });
    }
    else {
      done();
    }
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
    this.stats.nofollowed += 1;
    done(null, item, []);
    return;
  }

  //// Extract and normalize links
  var links = _.chain($('a'))
  // transform into a cheerio element
  .map( function(link) { return $(link); })
  // filter out links with nofollow
  .filter(this._followable, this)
  // Normalize
  .map( function(link) { return this.normalizeUrl(link, response); }, this)
  // Check against allowed rules
  .filter(this._allowedUrl, this)
  // Extract to an array
  .value();

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
    this.stats.nofollowed += 1;
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
// Discards query params
Crawler.prototype.normalizeUrl = function(link, response) {
  var href = link.attr('href');

  // unencode %7Eexample => ~example
  href = unescape(href);

  // Split the link and the response url into parts
  var hrefInfo = url.parse(href, true, true);
  var requestInfo = url.parse(response.url, true, true);

  // Build up an object to pass to url.format
  var resultParts = {};
  resultParts.protocol = hrefInfo.protocol || requestInfo.protocol;
  resultParts.hostname = hrefInfo.hostname || requestInfo.hostname;

  resultParts.port = hrefInfo.port || requestInfo.port;
  // If the port is the default port, discard
  if (resultParts.port == 80) {
    resultParts.port = '';
  }

  // Fully resolve paths
  resultParts.pathname = url.resolve(requestInfo.pathname, (hrefInfo.pathname || ''))
  resultParts.pathname = resultParts.pathname.replace(/\/+/g, '/');

  // Reconstitue the normalized url
  var normalizedUrl = url.format(resultParts);

  // Remove trailing slash
  if (normalizedUrl.slice(-1) === '/') {
    normalizedUrl = normalizedUrl.substr(0, normalizedUrl.length -1);
  }

  // Remove the directory index
  var dirIndexRe = /(index.(htm|html|php)|default.(asp|aspx))$/;
  if (normalizedUrl.match(dirIndexRe)) {
    normalizedUrl = normalizedUrl.substr(0, normalizedUrl.lastIndexOf('/'));
  }

  return normalizedUrl;
};

Crawler.prototype._process = function(item, links, done) {
  // If the only argument was the callback, call it
  if (_.isFunction(arguments[0])) {
    arguments[0]();
    return;
  }

  if (item) {
    this._processItem(item);
    this.emit('item', item);
  }

  if (links) {
    this._processLinks(links);
    this.emit('links', links);
  }

  done();
};

Crawler.prototype._processItem = function(item) {
  // A page isn't counted as crawled unless is creates an item.
  this.stats.pagesCrawled += 1;

  // Run all pipelines
  var self = this;
  async.each(this._pipelines, function(pipelineFn, cb) {
    pipelineFn.call(self, item, cb);
  }, function(err) {
    if (err) {
      log.error('Encountered error while processing pipeline: %s', err);
    }
  });

};

Crawler.prototype._processLinks = function(links) {
  this.log.debug('Extracted %s links: %s',
                  links.length,
                  JSON.stringify(links, null, '  >> '));

  // Default link handling
  _.each(links, this._addUrl, this);
};

Crawler.prototype._finish = function(err) {
  if (err) {
    this.log.critical('Encountered critical error: %s', err);
    return;
  }

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
  this.emit('finish');
};


exports = module.exports = Crawler;
