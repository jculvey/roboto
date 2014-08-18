var format = require('util').format;
var tldjs = require('tldjs');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var url = require('url');

var RobotsParser = function(options) {
  this.userAgent = options.userAgent || '';
  // A cache, keyed by domain
  this._cache = {};
};

// TODO: handle ports
// TODO: handle redirects to a max of numHops
// TODO: Handle http result codes
//        see: https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt
// Sitemap parsing
//   Should return sitemaps as a json object


// Url passed must be absolute (and not malformed)
RobotsParser.prototype.allowed = function(href, cb) {
  var self = this;
  var domain = tldjs.getDomain(href);
  if (process.env.NODE_ENV === 'test') {
    domain = url.parse(href).host;
  }

  var pathname = url.parse(href).pathname;

  this._fetchRobotsFile(domain, function(robotsTxt) {
    var rules = self._parseRules(robotsTxt);
    var botRules = rules.userAgents[self.userAgent] || rules.userAgents['*'];

    // If there's no robots directives, allow everything
    if (!botRules ) {
      cb(true);
    }

    var allowed = true;
    _.each(botRules.disallow, function(directiveRe) {
      if (pathname.match(directiveRe)) {
        allowed = false;
      }
    }, this);

    _.each(botRules.allow, function(directiveRe) {
      if (pathname.match(directiveRe)) {
        allowed = true;
      }
    }, this);

    cb(allowed);
  })
};

/*
{
  sitemaps: ['http://foo.com/sitemaps/sitemap.xml']
  userAgents: {
    '*': {
      allow: ['/foo/', '/bar/'],
      disallow: ['/search']
    }
  }
}
*/

function directiveToRegex(directive) {
  var path = directive.replace(/(Disallow:|Allow:)\s?/,'')
             .replace(/\./, '\.')
             .replace(/\*/, '.*')

  return new RegExp(path);
}

RobotsParser.prototype._parseRules = function(fileTxt) {
  var lines = fileTxt.split('\n');

  var res = {};
  res.sitemaps = [];
  res.userAgents = {};

  var currentUserAgent = '';
  _.each(lines, function(line) {
    // Add Sitemaps
    if (line.indexOf('Sitemap:') > -1) {
      res.sitemaps.push(line.split('Sitemap: ')[1]);
    }

    // Begin a new user-agent group
    if (line.indexOf('User-agent:') > -1) {
      var userAgent = currentUserAgent = line.split('User-agent: ')[1];
      if (!res.userAgents[userAgent]) {
        res.userAgents[userAgent] = {
          allow: [],
          disallow: []
        };
      }
    }

    // Add disallow directive for group
    if (line.indexOf('Disallow:') > -1) {
      var directive = directiveToRegex(line);
      res.userAgents[currentUserAgent].disallow.push(directive);
    }

    // Add allow directive for group
    if (line.indexOf('Allow:') > -1) {
      var directive = directiveToRegex(line);
      res.userAgents[currentUserAgent].allow.push(directive);
    }
  });

  return res;
};

RobotsParser.prototype._fetchRobotsFile = function(domain, done) {
  // attempt to get cached hostname
  if (this._cache[domain]) {
    done(this._cache[domain]);
  }
  else {
    var self = this;
    var robotsUrl = 'http://' + domain + '/robots.txt';
    request(robotsUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        self._cache[domain] = body;
        done(body);
      }
    })
  }

};

exports = module.exports = RobotsParser;
