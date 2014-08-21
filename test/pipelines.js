var assert = require("assert");
var roboto = require('../lib/roboto');
var html_strip = require('htmlstrip-native').html_strip;
var Log = require('log');

var fixtures = require('./fixtures');
var mockserver = null;
var crawler = null;

var stripOptions = {
  include_script : false,
  include_style : false,
  compact_whitespace : true
};

process.env['NODE_ENV'] = 'test';

describe('Pipelines', function(){
  beforeEach(function() {
    mockserver = require('./mockserver').createServer(9999);
    crawler = fixtures.storiesCrawler();

    crawler.parseField('url', function(response) {
      return response.url;
    });

  });

  afterEach(function() {
    delete crawler;
    mockserver.close();
  });

  it('should produce items', function(done){
    var items = [];
    crawler.pipeline(function(item, cb){
      items.push(item);
      cb();
    });

    crawler.parseField('body', function(response, $) {
      var html = $('body').html();
      if (html) {
        return html_strip(html, stripOptions);
      }
    });

    crawler.once('finish', function(){
      var stats = crawler.stats;
      assert.equal(stats.pagesCrawled, 4);
      assert.equal(items.length, 4);
      done();
    });

    crawler.crawl();
  })

  it('should fail gracefully items', function(done){
    var items = [];

    crawler.pipeline(function(item, done) {
      throw new Error('bad stuff happened');
    });

    crawler.once('finish', function(){
      done();
    });

    crawler.crawl();
  })

})




