var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var url = require('url');
var log = require('./logger');

/*
queue: {
  'foo.com': {
    lastFetch: 12345,
    links: [
    ]
  }
}
*/

var UrlFrontier = function(options, botParser) {
  this.options = options;
  this.botParser = botParser;
  this._frontier = {};
  this._domainQueue = [];
  this._seen = [];
  this._initFrontier(options.startUrls);
};

UrlFrontier.prototype._initFrontier = function(startUrls) {
  _.each(startUrls, function(href) {
    this._enqueue({
      href: href,
      depth: 0,
      referer: 'root'
    });
  }, this);
};

UrlFrontier.prototype.emptyQueue = function() {
  var empty = true;
  _.each(this._frontier, function(bucket, key) {
    if (bucket.links.length > 0) {
      empty = false;
    }
  });
  return empty;
};

UrlFrontier.prototype._domainsByAge = function() {
  var res = _.chain(_.pairs(this._queue))
  .map(function(item) {
    return { 
      domain: item[0],
      msSinceLastFetch: moment().diff(item[1].lastFetch)
    }
  })
  .sortBy(function(item) {
    return item.msSinceLastFetch
  })
  .value();

  return res;
}

UrlFrontier.prototype._peekDomainQ = function(domain) {
  return this._frontier[domain].links[0];
}

UrlFrontier.prototype._domainDequeue = function(domain) {
  return this._frontier[domain].links.shift();
}

// This will block until an url is available to
// be crawled
UrlFrontier.prototype.getNextLink = function(done, origHeadDomain) {
  var self = this;
  var opts = this.options;

  // Fetch the next domain in line
  var domain = this._domainQueue.shift();
  // Rotate the domain to the back of the queue
  this._domainQueue.push(domain);

  // If the link queue of the domain is empty, keep looking
  var firstLink = self._peekDomainQ(domain);
  if (!firstLink) {
    this.getNextLink(done, origHeadDomain);
    return;
  }

  // Detect cycles.
  if (origHeadDomain) {
    // If we've gone all the way around,
    // it's time to wait until theres an available link
    if (origHeadDomain === domain) {
      this.botParser.crawlDelay(firstLink.href, function(robotsDelay) {
        var msSinceLastFetch = moment().diff(self._frontier[domain].lastFetch);
        var delay = (opts.obeyRobotsTxt && robotsDelay) || opts.requestDelay;
        setTimeout(done, delay, self._domainDequeue(domain));
      });
      return;
    }
  }
  else {
    origHeadDomain = domain;
  }

  this.botParser.crawlDelay(firstLink.href, function(robotsDelay) {
    var msSinceLastFetch = moment().diff(self._frontier[domain].lastFetch);
    var delay = (opts.obeyRobotsTxt && robotsDelay) || opts.requestDelay;
    if (delay < msSinceLastFetch) {
      done(self._domainDequeue(domain));
    }
    else {
      // If the next link for this queue isn't ready to be crawled, recurse
      self.getNextLink(done, origHeadDomain);
    }
  });

};

UrlFrontier.prototype.addUrl = function(prevUrl, href) {
  var domain = url.parse('href').hostname;

  var maxDepth = this.options.maxDepth;
  if(maxDepth && prevUrl.depth >= maxDepth) {
    return;
  }

  if(!_.contains(this._seen, href)) {
    this._seen.push(href);
    this._enqueue({
      href: href, 
      depth: prevUrl.depth + 1, 
      referer: prevUrl
    });
  }
};

UrlFrontier.prototype._enqueue = function(link, depth, referer) {
  var href = link.href;
  var domain = url.parse(href).hostname;

  if (!this._frontier[domain]) {
    this._frontier[domain] = {
      links: []
    }
  }

  // Update the last fetch time and add link
  this._frontier[domain].lastFetch = moment();
  this._frontier[domain].links.push(link);

  // Add the link to the domain queue
  if (!_.contains(this._domainQueue, domain)) {
    this._domainQueue.push(domain);
  }

};

exports = module.exports = UrlFrontier;


//UrlFrontier.prototype.getNextLink = function(done) {
  //// Sorting by fetch time doesn't work.
  //// use a carousel instead
  //// keep a domain queue like so:
  ////   [ 'foxnews.com', 'bbc.com' ]
  //// get next should 
  ////  1. unshift the domain queue
  ////  2. while not ready yet, send to end of line
  ////  3. return
  //// A while loop will make this blocking, but its better.
  //// This really should block until an url is available.

  //var self = this;
  //var opts = this.options;

  //var domainsByAge = this._domainsByAge();

  //async.detect(domainsByAge, function(entry, done) {
    //var domain = entry.domain;

    //// If the domain queue is empty, skip
    //var firstLink = self._peekDomainQ(domain);
    //if (!!!firstLink) {
      //done(false);
      //return;
    //}

    //self.botParser.crawlDelay(firstLink.href, function(robotsDelay) {
      //var delay = (opts.obeyRobotsTxt && robotsDelay) || opts.requestDelay;
      //if (delay < entry.msSinceLastFetch) {
        //done(true);
      //}
      //else {
        //done(false);
      //}
    //});

  //}, function(nextAvailable) {
    //if (!nextAvailable) {
      //// If no link is available for crawl yet, set a timeout
      //// for the difference
      //var firstDomain = domainsByAge[0];
      //// BUG: This should really be the delay calculated above
      //var delay = opts.requestDelay - firstDomain.msSinceLastFetch; 
      //setTimeout(function(){
        //var link = self._domainDequeue(firstDomain.domain);
        //done(link);
      //}, delay);
    //}
    //else {
      //var link = self._domainDequeue(nextAvailable.domain);
      //done(link);
    //}
  //});

//};
