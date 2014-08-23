var format = require('util').format;
var tldjs = require('tldjs');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var url = require('url');
var log = require('./logger');

// TODO: handle ports
// TODO: handle redirects to a max of numHops
// TODO: Handle http result codes
//        see: https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt
// Sitemap parsing
//   Should return sitemaps as a json object

var RobotsParser = function(options) {
  this.userAgent = options.userAgent || '';
  this.requestTimeout = options.requestTimeout;

  // A rules map, keyed by domain
  /* Like this:
  {
    'foo.com' : {
      sitemaps: ['http://foo.com/sitemaps/sitemap.xml']
      crawlDelay: null,
      rules: {
        allow: ['/foo/', '/bar/'],
        disallow: ['/search']
      }
      // Alternatively
      rules: 'allow' // or 'disallow'
    }
  }
  */
  this._instructions = {};
};

// Url passed must be absolute (and not malformed)
RobotsParser.prototype.allowed = function(href, cb) {
  var self = this;

  var pathname = url.parse(href).pathname;
  var domain = this._getDomainFromHref(href);

  this._fetchInstructions(domain, function(instructions) {
    var rules = instructions.rules;

    if (!rules) {
      cb(true);
    }
    else if (_.isString(rules) && rules == 'disallow') {
      cb(false);
    }
    else if (_.isString(rules) && rules == 'allow') {
      cb(true);
    }
    else {
      var allowed = true;
      _.each(rules.disallow, function(directiveRe) {
        if (pathname.match(directiveRe)) {
          allowed = false;
        }
      }, this);

      _.each(rules.allow, function(directiveRe) {
        if (pathname.match(directiveRe)) {
          allowed = true;
        }
      }, this);

      cb(allowed);
    }
  })

};

RobotsParser.prototype._getDomainFromHref = function(href) {
  var domain = url.parse(href).hostname;
  //var domain = tldjs.getDomain(url);
  if (process.env.NODE_ENV === 'test') {
    domain = url.parse(href).host;
  }
  return domain;
}

RobotsParser.prototype._fetchInstructions = function(domain, cb) {
  var self = this;

  // Check for cached rules
  var domainInstructions = this._instructions[domain];
  if (domainInstructions) {
    cb(domainInstructions);
  }
  else {
    this._fetchRobotsFile(domain, function(statusCode, robotsTxt) {
      var instructions = null;
      if (statusCode >= 500) {
        instructions = { rules: 'disallow' };
      }
      else if (statusCode >= 400 || robotsTxt === '') {
        instructions = { rules: 'allow' };
      }
      else {
        try {
          instructions = self._parseInstructions(robotsTxt);
        }
        catch(err) {
          instructions = { rules: 'disallow' };
        }
      }
      self._instructions[domain] = instructions;
      cb(instructions);
    })
  }
};

RobotsParser.prototype._fetchRobotsFile = function(domain, done) {
  var self = this;
  var robotsUrl = 'http://' + domain + '/robots.txt';

  var reqOptions = {
    url: robotsUrl,
    timeout: this.requestTimeout
  };
  request(reqOptions, function (error, response, body) {
    if (error) {
      // Treat connection errors like 404s
      done('404', '');
      log.error('Error in robots parser for %s : %s', robotsUrl, error);
    }
    else {
      done(response.statusCode, body);
    }
  })
};

RobotsParser.prototype.crawlDelay = function(href, cb) {
  var pathname = url.parse(href).pathname;
  var domain = this._getDomainFromHref(href);

  this._fetchInstructions(domain, function(instructions) {
    if (instructions.crawlDelay) {
      cb(instructions.crawlDelay * 1000);
    }
    else {
      cb(null);
    }
  })
}

function directiveToRegex(directive) {
  var path = directive.replace(/(Disallow|Allow):?\s?/i,'')
             // Escape regular expression symbols
             .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

  return new RegExp(path);
}

RobotsParser.prototype._parseInstructions = function(fileTxt) {
  var lines = fileTxt.split('\n');
  var parsedRules = {};

  var res = {};
  res.sitemaps = [];

  var currentUserAgent = '';
  _.each(lines, function(line) {
    var userAgentDirective = line.match(/^user-agent:?\s?/i);
    var disallowDirective = line.match(/^disallow:?\s?/i);
    var allowDirective = line.match(/^allow:?\s?/i);
    var crawlDelayDirective = line.match(/^crawl-delay:?\s?/i);
    var sitemapDirective = line.match(/^sitemap:?\s?/i);

    // Add Sitemaps
    if (line.match(sitemapDirective)) {
      res.sitemaps.push(line.replace(sitemapDirective,'').trim());
    }

    // Begin a new user-agent group
    if (line.match(userAgentDirective)) {
      var userAgent = currentUserAgent = line.replace(userAgentDirective,'').trim();
      if (!parsedRules[userAgent]) {
        parsedRules[userAgent] = {
          allow: [],
          disallow: []
        };
      }
    }

    // Add disallow directive for group
    if (line.match(disallowDirective)) {
      var directive = directiveToRegex(line);
      parsedRules[currentUserAgent].disallow.push(directive);
    }

    // Add allow directive for group
    if (line.match(allowDirective)) {
      var directive = directiveToRegex(line);
      parsedRules[currentUserAgent].allow.push(directive);
    }

    // Add disallow directive for group
    if (line.match(crawlDelayDirective)) {
      var delayString = line.replace(crawlDelayDirective,'').trim();
      var crawlDelay = parseInt(delayString);
      res.crawlDelay = crawlDelay;
    }

  });

  res.rules = parsedRules[this.userAgent] || parsedRules['*'];
  return res;
};


exports = module.exports = RobotsParser;
