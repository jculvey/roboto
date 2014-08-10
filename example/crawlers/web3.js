var config = require('./config');
var robotoSolr = require('roboto-solr');
var itemLogger = require('roboto-item-logger');

var web3Crawler = new roboto.Crawler({
  name: 'web3',
  allowed_domains: [
    'web3.lab.nbttech.com'
  ],
  start_urls: [
    'http://web3.lab.nbttech.com/docs/dev_guide/',
    'http://web3.lab.nbttech.com/docs/design_docs/',
    'http://web3.lab.nbttech.com/docs/js_docs/'
  ],
  blacklist: [
    /(\/js_docs\/modules)/,
    /(\/js_docs\/classes\/A\.)/,
    /(:8080)/,
    /(\/resources\/)/
  ]
});

web3Crawler.parseField('title', function(response) {
  var $ = response.$;
  return $('h1::text');
});

web3Crawler.parseField('body', function(response) {
  var devGuide = response.url.indexOf('dev_guide') > -1;
  var designDocs = response.url.indexOf('design_docs') > -1;

  if (devGuide || designDoc){
    return sanitize_html($('div.section'));
  }
  return '';
});

web3Crawler.parseField('data_source', function(response) {
  return 'web3';
});

web3Crawler.pipeline(robotoSolr(config.solrConfig));
web3Crawler.pipeline(itemLogger);

exports = web3Crawler;
