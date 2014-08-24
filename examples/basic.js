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

var dmozCrawler = new roboto.Crawler({
  startUrls: [
    'http://www.dmoz.org/',
  ],
  allowedDomains: [
    'dmoz.org'
  ],
  // Demonstrating blacklisting.
  // Any url with /FAQ/ in it will be filtered.
  blacklist: [
    /FAQ/,
  ]
});

dmozCrawler.parseField('url', function(response, $) {
  return response.url;
});

dmozCrawler.parseField('body', function(response, $) {
  var html = $('body').html();
  return html_strip(html, stripOptions);
});

dmozCrawler.parseField('title', function(response, $) {
  return $('head title').text();
});

dmozCrawler.parseField('server', function(response, $) {
  return response.headers['server'] || '';
});

dmozCrawler.on('item', function(item) {
  // Do something with the item!
});

dmozCrawler.crawl();
