var roboto = require('../lib/roboto');
var Log = require('log');
var logLevel = process.env['LOG_LEVEL'] || 'critical';
var log = new Log(logLevel)

exports = module.exports = {};

exports.storiesCrawler = function() {
  var crawler = new roboto.Crawler({
    allowedDomains: [ 'localhost' ],
    startUrls: [ 'http://localhost:9999/stories/index.html' ],
    blacklist: [ /accounts/ ]
  });
  crawler.log = log;
  return crawler;
}

exports.delayCrawler = function() {
  var crawler = new roboto.Crawler({
    requestDelay: 40,
    allowedDomains: [ 'localhost' ],
    startUrls: [
      'http://localhost:9999/static/delay/index.html',
    ]
  });
  crawler.log = log;
  return crawler;
}
