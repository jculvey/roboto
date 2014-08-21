#!/usr/bin/env node
// Normally, you import roboto like this:
//var roboto = require('roboto');

// Note that their robots.txt defines 'Crawl-Delay: 30', thus the delay.

var roboto = require('../lib/roboto');
var html_strip = require('htmlstrip-native').html_strip;

var crawler = new roboto.Crawler({
  startUrls: [
    "https://news.ycombinator.com/",
  ],
  allowedDomains: [
    "news.ycombinator.com",
  ],
});

crawler.parseField('url', function(response) {
  return response.url;
});

crawler.parseField('title', function(response, $) {
  return $('head title').text();
});

crawler.parseField('body', function(response, $) {
  var html = $('body').html();
  if (html) {
    return html_strip(html, stripOptions);
  }
});

crawler.crawl();
