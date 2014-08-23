#!/usr/bin/env node
// Normally, you import roboto like this:
//var roboto = require('roboto');
var roboto = require('../lib/roboto');
var _ = require('underscore');

var crawler = new roboto.Crawler({
  allowedDomains: [
    'example.com'
  ],
  startUrls: [
    'http://example.com/docs/guide/'
  ]
});

var deadLinks = [];
crawler.on('httpError', function(statusCode, href, referer) {
  if (statusCode === 404) {
    deadLinks.push({
      href: href,
      referer: referer
    });
  }
});

crawler.on('finish', function() {
  _.each(deadLinks, function(deadLink) {
    console.log('Dead link: %s  found on page: %s', deadLink.href, deadLink.referer);
  });
});

crawler.crawl();
