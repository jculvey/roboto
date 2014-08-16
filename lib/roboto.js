var Crawler = require('./crawler');

exports = module.exports = {};

// Expose built in middleware
exports.downloaders = {};
exports.downloaders.httpAuth = require('./downloaders/httpAuth');
exports.pipelines = {};
exports.pipelines.robotoSolr = require('./pipelines/roboto-solr');

exports.Crawler = Crawler;

//exports.Crawler = function(options) {
  //// Merge opts with defaults
  //this.options = _.extend({
    //userAgent:      "roboto/" + exports.VERSION,
    //logLevel: 'info',
  //}, options);

  //// Expose useful things
  //this.defaultRequestOptions = {
    //method: 'GET',
    //timeout: this.options.requestTimeout,
    //headers: {
        //'User-Agent': this.options.userAgent
    //},
  //}
  //this.log = log = new Log(this.options.logLevel);

  //this.stats = defaultStats;
  //this._queue = [];
  //this._seen = [];

  //this._fieldParsers = {};
  //this._pipelines = [ itemLogger({log: log}) ];
  //this._downloader = defaultDownloader;

  //events.EventEmitter.call(this);
//};

