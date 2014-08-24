#!/usr/bin/env node
// Normally, you import roboto like this:
//var roboto = require('roboto');
var roboto = require('roboto');

var html_strip = require('htmlstrip-native').html_strip;
var stripOptions = {
  include_script : false,
  include_style : false,
  compact_whitespace : true
};

// Crawls the top 20 news sites according to Alexa
// (and vicenews, which ought to be).
var crawler = new roboto.Crawler({
  startUrls: [
    "http://www.reddit.com",
    "http://www.cnn.com",
    "https://news.vice.com",
    "http://www.bbc.com/news/world",
    "http://www.huffingtonpost.com",
    "http://www.nytimes.com/",
    "http://www.theguardian.com/us",
    "http://www.forbes.com",
    "https://news.google.com",
    "http://timesofindia.indiatimes.com/international",
    "http://www.foxnews.com/",
    "http://online.wsj.com/home-page",
    "http://www.washingtonpost.com/",
    "http://www.usatoday.com/",
    "http://www.reuters.com/",
    "http://time.com/",
    "http://www.bloomberg.com/",
  ],
  // This option will limit the crawl to only
  // these domains.
  constrainToRootDomains: true,
});

crawler.parseField('title', function(response, $) {
  var titleNode = $('head title');
  if (titleNode) {
    return titleNode.text();
  }
  else {
    return '';
  }
});

crawler.parseField('url', function(response) {
  return response.url;
});

crawler.parseField('body', function(response, $) {
  var html = $('body').html();
  var strippedHtml = html_strip(html, stripOptions);
  // Truncate large responses
  return strippedHtml.substr(0, 160);
});

crawler.crawl();
