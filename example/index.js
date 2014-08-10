#!/usr/bin/env node
var roboto = require('roboto');

var infrabot = roboto();
infrabot.loadCrawlers(dirname + '/crawlers');

var newsbot = roboto();

// Configure basic things
newsbot.set('user-agent', 'newsbot (+http://www.newsbot.com)');

// crawlers can be loaded en masse from a directory
newsbot.loadCrawlers('./crawlers');
new(express.static(__dirname + '/public')

// or added manually
var cnnCrawler = new roboto.Crawler({
  start_urls: [
    "http://www.cnn.com",
  ],
  allowed_domains: [
    "cnn.com",
  ],
  maxRequests: 25000
});
cnnCrawler.pipeline(itemLogger);

newsbot.addCrawler('cnn', cnnCrawler);

// Launch manually
newsbot.crawl('cnn');
