#!/usr/bin/env node
// Normally, you import roboto like this:
//var roboto = require('roboto');
var roboto = require('../lib/roboto');

var html_strip = require('htmlstrip-native').html_strip;
var stripOptions = {
  include_script : false,
  include_style : false,
  compact_whitespace : true
};

var crawler = new roboto.Crawler({
  startUrls: [
    "https://news.ycombinator.com/",
  ],
  allowedDomains: [
    "news.ycombinator.com",
  ],
  // Note that there is a delay due to directive 'Crawl-Delay: 30'
  // defined in their robots.txt
  //obeyRobotsTxt: false
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
