var roboto = require('../lib/roboto');
var Log = require('log');

exports = module.exports = {};

exports.storiesCrawler = function() {
  var crawler = new roboto.Crawler({
    allowedDomains: [ 'localhost' ],
    startUrls: [ 'http://localhost:9999/stories/index.html' ],
    blacklist: [ /accounts/ ]
  });
  return crawler;
}

