#!/usr/bin/env node
var robotoHttpAuth = require('roboto-http-auth');
var robotoSolr = require('roboto-solr');
var config = require('./config');

var twikiCrawler = new roboto.Crawler({
  allowed_domains: [
    "twiki.nbttech.com",
  ],
  start_urls: [
    "https://twiki.nbttech.com/twiki/bin/view/NBT",
  ],
  blacklist: [
    /(WebIndex|WebTopicCreator)/
  ],
  whitelist_urls: [
    /twiki\/bin\/view\/(NBT|NBTUnreleased)/
  ]
});

twikiCrawler.downloader(robotoHttpAuth({
  httpAuth: {
    user: 'bob',
    pass: 'bigboy'
  }
}));

twikiCrawler.parse = function(response) {
  var $ = cheerio.load(response.body);

  var item = {};
  item.url = response.url;
  item.data_source = 'twiki';

  return item;
}

twikiCrawler.extractLinks = function(response) {
  var links = [];
  $('a').each( function() {
    return $(this).attr('href');
  });
}

twikiCrawler.processLink = function(response, link_tag, href) {
  return href;
}

twikiCrawler.pipeline(robotoSolr(config.solrConfig));
twikiCrawler.pipeline(itemLogger);

exports = twikiCrawler;
