#!/usr/bin/env node

var twikiCrawler = new Crawler({
  httpAuth: {
    user: 'bob',
    pass: 'bigboy'
  },
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

crawler.parse = function(response) {
  var $ = cheerio.load(response.body);

  var item = {};
  item.url = response.url;
  item.data_source = 'twiki';

  return item;
}

crawler.extract_links = function(response) {
  var links = [];
  $('a').each( function() {
    return $(this).attr('href');
  });
}

crawler.process_link = function(response, link_tag, href) {
  return href;
}

var robotoSolr = require('roboto-solr');
var solrConfig = {
  url: "http://localhost:8983/solr/collection1"
  field_map: {
    'id': 'url',
    'content': 'body',
    'title': 'title',
    'author': 'author',
    'last_modified': 'last_modified',
    'data_source': 'data_source',
    'index_timestamp': 'index_timestamp',
  }
};

crawler.pipeline(robotoSolr(solrConfig));

// May need a way to add middleware to downloaders
crawler.downloader(robotoHttpAuth);

// Make a simple middleware mechanism. Anyone can write a function that
// takes an item to make a middleware
function (item) {
  // write to solr
}

var itemLogger = function(item) {
  console.log(JSON.stringify(item));
};
crawler.use_pipeline(itemLogger);


/*

Command Launcher
- Repl like scrapy shell command.
- simple parse like scrapy parse
- full on crawl launcher that outputs to stdout

*/

exports.crawlers = {
  'twiki': twikiCrawler
}




