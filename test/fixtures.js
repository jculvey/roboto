var roboto = require('../lib/roboto');
var Log = require('log');

exports = module.exports = {};

function testLog() {
  var logLevel = process.env['LOG_LEVEL'] || 'critical';
  return new Log(logLevel);
}
exports.testLog = testLog;

exports.storiesCrawler = function() {
  var crawler = new roboto.Crawler({
    allowedDomains: [ 'localhost' ],
    startUrls: [ 'http://localhost:9999/stories/index.html' ],
    blacklist: [ /accounts/ ]
  });
  crawler.log = testLog();
  return crawler;
}

