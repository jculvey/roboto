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
var tldjs = require('tldjs');

// Roboto depedencies
var log = require('./logger');
var defaultDownloader = require('./downloaders/default')();
var itemLogger = require('./pipelines/item-logger');
var BotParser = require('./robotsParser');
var UrlFrontier = require('./urlFrontier');
var LinkExtractor = require('./linkExtractor');
var Stats = require('./stats');

var Crawler = function(options) {
  // Merge opts with defaults
  this.options = _.extend({
    allowedContentTypes: [
      'text/html',
      'application/xhtml+xml',
      'application/xml'
    ],
    allowedSchemes: [ 'http', 'https' ],
    constrainToRootDomains: false,
    logLevel: 'info',
    maxDepth: null,
    obeyRobotsTxt: true,
    requestDelay: 0,
    requestTimeout: 10000,
    statsDumpInterval: 20,
    userAgent: 'roboto',
  }, options);

  // Initialize the robots.txt parser
  this.botParser = new BotParser({ 
    userAgent: this.options.userAgent,
    timeout: this.options.requestTimeout
  });

  // Expose useful things
  this.defaultRequestOptions = {
    method: 'GET',
    timeout: this.options.requestTimeout,
    headers: {
        'User-Agent': this.options.userAgent
    },
  }

  if (this.options.constrainToRootDomains) {
    this.options.allowedDomains = this.options.allowedDomains || [];
    _.each(this.options.startUrls, function(startUrl) {
      //var domain = url.parse(startUrl).hostname;
      var domain = tldjs.getDomain(startUrl);
      this.options.allowedDomains.push(domain);
    }, this);
  }

  this.stats = Stats.defaultStats();
  this._urlFrontier = new UrlFrontier(this.options, this.botParser);
  this._linkExtractor = new LinkExtractor(this.options, this.stats);

  this._fieldParsers = {};
  this._pipelines = [ itemLogger()];
  this._downloader = defaultDownloader;


  this.on('start', function(href) {
    log.info('Beginning Crawl.');
  });

  this.on('next', function(link) {
    log.info('Crawling %s', link.href);
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
  var nextLink = self._urlFrontier.getNextLink( function(link){
    self.emit('next', link);
    self._crawlPage(link, done);
  });
};

Crawler.prototype._crawlAfterDelay = function(delay, link, done) {
    setTimeout(this._crawlPage.bind(this), delay, link, done);
};

Crawler.prototype._crawlPage = function(link, done) {
  var self = this;
  var opts = this.options;
  var stats = this.stats;

  // Dump stats if needed
  var dump = stats.pagesCrawled && stats.pagesCrawled % opts.statsDumpInterval === 0;
  if (dump) {
    self.dumpStats();
  }

  // TODO: Move the robots check to link extractor
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
        if (err) log.error('Ecountered error: %s', err);
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
    log.info('Downloading: %s', href);
    this.emit('download', href);

    var handler = function(err, response, body) {
      // handle network/dns/request errors
      if (err) {
        log.error('Encountered the following error while requesting <%s>: %s', href, err);
        this.stats.requestErrors += 1;
        done();
        return;
      }

      // Skip disallowed filetypes
      var contentType = response.headers['content-type'];
      if (!contentType) {
        var msg = format('Discarding response from %s. No content type specified.', response.url);
        log.error(msg);
        done(msg);
        return;
      }

      var allowedContentType = false;
      _.each(this.options.allowedContentTypes, function(allowedType) {
        if(contentType.indexOf(allowedType) > -1) {
          allowedContentType = true;
        }
      });

      if (!allowedContentType) {
        var msg = format('Discarding response from %s. Disallowed content type: %s', response.url, contentType);
        log.error(msg);
        done(msg);
        return;
      }

      // Discard client and server errors. Log other status codes.
      var statusCode = response.statusCode;
      if (statusCode >= 400) {
        if (statusCode == 404) { this.stats.download.status404 += 1; }
        log.error('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
        this.emit('httpError', statusCode, href, link.referer.href);
        done();
      }
      else if (statusCode > 200) {
        log.info('Encountered a %s (%s) while requesting <%s>', statusCode, http.STATUS_CODES[statusCode], href);
        // TODO: Better stats logging here
        done();
      }
      else {
        this.stats.download.status200 += 1;
        var res = _.extend(response, { url: href });

        var cheerioOptions = {
          normalizeWhitespace: true
        };
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

  var links = this._linkExtractor.extractLinks(response, $);
  // move link extraction here
  if (links) {
    var prettyLinks = JSON.stringify(links, null, '  >> ');
    log.debug('Extracted %s links: %s', links.length, prettyLinks);

    // Default link handling
    _.each(links, function(href) {
        this._urlFrontier.addUrl(currentLink, href);
    }, this);

    this.emit('links', links);
  }

  done(null, item);
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
      log.error('Encountered error while processing pipeline: %s', err);
    }
  });

};

Crawler.prototype._finish = function(err) {
  if (err) {
    log.critical('Encountered critical error: %s', err);
    return;
  }

  log.info('Finished crawl.');
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
