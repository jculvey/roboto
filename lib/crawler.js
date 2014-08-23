var util = require('util');
var format = require('util').format;
var EE = require("events").EventEmitter;

var UrlFrontier = require('./urlFrontier');
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
    maxDepth: null,
    logLevel: 'info',
    requestDelay: 0,
    obeyRobotsTxt: true,
    allowedContentTypes: [
      'text/html',
      'application/xhtml+xml',
      'application/xml'
    ],
    statsDumpInterval: 20
  }, options);

  // Initialize log
  log = this.log = new Log(this.options.logLevel);

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
  this._urlFrontier = new UrlFrontier(this.options, log);

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
  this.emit('start');

  var self = this;
  async.until(
    function(){ return self._urlFrontier.emptyQueue(); },
    function(done) {
      self._crawlNext(done);    // run this while test is true
    },
    function(done){
      self._finish(done);       // do this when its all done
    }
  );

};

Crawler.prototype._crawlNext = function(done) {
  var self = this;
  var nextLink = self._urlFrontier.getNextLink();
  var href = nextLink.href;
  self.emit('next', href);

  var opts = this.options;
  var stats = this.stats;

  // Dump stats if needed
  var dump = stats.pagesCrawled && stats.pagesCrawled % opts.statsDumpInterval === 0;
  if (dump) {
    self.dumpStats();
  }

  self.botParser.crawlDelay(href, function(robotsDelay) {
    var delay = (opts.obeyRobotsTxt && robotsDelay) || opts.requestDelay;
    self._crawlAfterDelay(delay, nextLink, done);
  });
};

Crawler.prototype._crawlAfterDelay = function(delay, link, done) {
    setTimeout(this._crawlPage.bind(this), delay, link, done);
};

Crawler.prototype._crawlPage = function(link, done) {
  var self = this;
  var obeyRobotsTxt = this.options.obeyRobotsTxt;

  var href = link.href;
  // Filter out links disallowed by robots.txt
  this.botParser.allowed(href, function(allowed) {
    if (allowed) {
      // Check the robots file here
      async.waterfall([
        self._download(link).bind(self),
        self._parse.bind(self),
        self._process.bind(self),
      ], function(err) {
        if (err) self.log.error('Ecountered error: %s', err);
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
Crawler.prototype._download = function(link) {
  var href = link.href;

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

      // Skip disallowed filetypes
      var contentType = response.headers['content-type'];
      var allowedContentType = false;
      _.each(this.options.allowedContentTypes, function(allowedType) {
        if(contentType.indexOf(allowedType) > -1) {
          allowedContentType = true;
        }
      });
      var statusCode = response.statusCode;

      if (!allowedContentType) {
        var msg = format('Discarding response from %s. Disallowed content type: %s', response.url, contentType);
        this.log.error(msg);
        done(msg);
      }
      // Discard client and server errors. Log other status codes.
      else if (statusCode >= 400) {
        if (statusCode == 404) { this.stats.download.status404 += 1; }
        this.log.error('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
        this.emit('httpError', statusCode, href, link.referer.href);
        done();
      }
      else if (statusCode === 302) { this.stats.download.status302 += 1; }
      else if (statusCode === 301) { this.stats.download.status301 += 1; }
      else if (statusCode > 200) {
        this.log.info('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
      }
      else {
        this.stats.download.status200 += 1;
        var res = _.extend(response, { url: href });
        res.$ = cheerio.load(body, cheerioOptions);

        done(null, link, res);
      }
    };

    this._downloader(href, handler.bind(this));
  }
};

// Parse an item and a list of links from the response.
Crawler.prototype._parse = function(currentLink, response, done) {
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
    try {
      item[fieldName] = parser(response, $);
    }
    catch(err) {
      done(err);
    }
  });

  // Check if the meta tags of a page specify nofollow
  var robotsMeta = $('meta[name="robots"]').attr('content');
  if (robotsMeta && robotsMeta.indexOf('nofollow') > -1) {
    this.stats.nofollowed += 1;
    done(null, item);
    return;
  }

  //// Extract and normalize links
  var links = _.chain($('a'))
  // transform into a cheerio element
  .map( function(link) { return $(link); })
  // filter out links with nofollow
  .filter(this._followable, this)
  // Normalize
  .map( function(href) { return this.normalizeUrl(href, response); }, this)
  // Check against allowed rules
  .filter(this._allowedUrl, this)
  // Extract to an array
  .value();
  debugger;

  // move link extraction here
  if (links) {
    var prettyLinks = JSON.stringify(links, null, '  >> ');
    this.log.debug('Extracted %s links: %s', links.length, prettyLinks);

    // Default link handling
    _.each(links, function(href) {
        this._urlFrontier.addUrl(currentLink, href);
    }, this);
    this.emit('links', links);
  }

  done(null, item);
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
  // Check filetypes

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
    // If a host cant be parsed from the url, disallow.
    var host = url.parse(href).hostname;
    if(!host) return false;

    // If no allowedDomains specified, allow
    if(!this.options.allowedDomains) return true;

    var allowedDomain = false;
    _.each(this.options.allowedDomains, function(allowed) {
      if (host.indexOf(allowed) > -1) {
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

Crawler.prototype._process = function(item, done) {
  // If the only argument was the callback, call it
  if (_.isFunction(arguments[0])) {
    arguments[0]();
    return;
  }

  if (item) {
    this._processItem(item);
    this.emit('item', item);
  }

  done();
};

Crawler.prototype._processItem = function(item) {
  // A page isn't counted as crawled unless is creates an item.
  this.stats.pagesCrawled += 1;

  // Run all pipelines
  var self = this;
  async.each(this._pipelines, function(pipelineFn, cb) {
    try {
      pipelineFn.call(self, item, cb);
    }
    catch(err) {
      cb(err);
    }
  }, function(err) {
    if (err) {
      self.log.error('Encountered error while processing pipeline: %s', err);
    }
  });

};

Crawler.prototype._finish = function(err) {
  if (err) {
    this.log.critical('Encountered critical error: %s', err);
    return;
  }

  this.log.info('Finished crawl.');
  this.dumpStats();
  this.emit('finish');
};

Crawler.prototype.dumpStats = function(err) {
  var now = moment();
  var hours = now.diff(this.stats.startTime, 'hours');
  var mins = now.diff(this.stats.startTime, 'minutes');
  var secs = now.diff(this.stats.startTime, 'seconds');
  var prettyFormat = "dddd, MMMM Do YYYY, h:mm:ss a";

  // For terser code
  var stats = this.stats;
  var log = this.log;
  log.info('  >> Started: %s ', stats.startTime.format(prettyFormat));
  log.info('  >> Duration: %s hours, %s minutes, %s seconds.', hours, mins, secs);
  log.info('  >> Page(s) crawled: %s', stats.pagesCrawled);
  log.info('  >> Page(s) nofollowed: %s', stats.nofollowed);
  log.info('  >> Request count: %s', stats.download.requestCount);
  log.info('  >> Request errors: %s', stats.download.requestErrors);
  log.info('  >> 200 OK count : %s', stats.download.status200);
  log.info('  >> 301 count : %s', stats.download.status301);
  log.info('  >> 302 count : %s', stats.download.status302);
  log.info('  >> 404 count : %s', stats.download.status404);
  log.info('  >> Filtered due to');
  log.info('    >> Disallowed domain: %s', stats.download.disallowedDomain);
  log.info('    >> Blacklist: %s', stats.download.blacklisted);
};


exports = module.exports = Crawler;
