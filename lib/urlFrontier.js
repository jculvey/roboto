var _ = require('underscore');

var UrlFrontier = function(options, log) {
  var urlFrontier = {
    _queue: [],
    _seen: [],
    _initQueue: initQueue,
    _maxDepth: options.maxDepth,
    addUrl: addUrl,
    emptyQueue: emptyQueue,
    getNextLink: getNextLink
  }
  urlFrontier.log = log;

  urlFrontier._initQueue(options.startUrls);
  return urlFrontier
};

function initQueue(startUrls) {
  this._queue = _.map(startUrls, function(href) {
    return {
      href: href,
      depth: 0,
      referer: 'root'
    }
  });
};

function emptyQueue() {
  return this._queue.length === 0;
};

function getNextLink() {
  return this._queue.shift();
};

function addUrl(prevUrl, href) {
  if(this._maxDepth && prevUrl.depth >= this._maxDepth) {
    return;
  }

  if(!_.contains(this._seen, href)) {
    this._seen.push(href);

    this._queue.push({
      href: href,
      depth: prevUrl.depth + 1,
      referer: prevUrl
    });
  }
};

exports = module.exports = UrlFrontier;
