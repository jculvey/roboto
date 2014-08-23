var assert = require("assert");
var roboto = require('../lib/roboto');
var fixtures = require('./fixtures');
var mockserver = null;
var crawler = null;

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
      return html;
    });

    crawler.once('finish', function(){
      var stats = crawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      assert.equal(items.length, 3);
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
