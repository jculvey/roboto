var format = require('util').format;
var _ = require('underscore');
var async = require('async');
var url = require('url');
var log = require('./logger');

var LinkExtractor = function(options, stats) {
  this.options = options;
  this.stats = stats;
};

LinkExtractor.prototype.extractLinks = function(response, $) {
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

  return links;
};

// Determine if the link can be followed. Links
// without href attributes, or links that have nofollow
// directives should return false.
LinkExtractor.prototype._followable = function(link) {
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
LinkExtractor.prototype._allowedUrl = function(href) {
  // Check schemes
  var scheme = url.parse(href).protocol.replace(':','');;
  if (!_.contains(this.options.allowedSchemes, scheme)) {
    return false;
  }

  // TODO: Check filetypes

  // Check against allowedDomains
  if(!this._allowedDomain(href)){
    this.stats.download.disallowedDomain += 1;
    return false;
  }

  return this._whitelist(href) && this._blacklist(href);
};

LinkExtractor.prototype._whitelist = function(href) {
  if(!this.options.whitelist) return true;

  var allowed = false;
  _.each(this.options.whitelist, function(rule) {
    if (href.match(rule)){
      allowed = true;
    }
  });

  return allowed;
};

LinkExtractor.prototype._blacklist = function(href) {
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

LinkExtractor.prototype._allowedDomain = function(href) {
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
      log.debug('Filtering offsite request: %s', href);
    }

    return allowedDomain;
};

// Normalize (canonicalize) the url.
// Discards query params
LinkExtractor.prototype.normalizeUrl = function(link, response) {
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


exports = module.exports = LinkExtractor;
