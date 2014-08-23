var assert = require("assert");
var roboto = require('../lib/roboto');
var Log = require('log');

var fixtures = require('./fixtures');
var mockserver = null;
var crawler = null;

process.env['NODE_ENV'] = 'test';

describe('Happy Path', function(){
  beforeEach(function() {
    mockserver = require('./mockserver').createServer(9999);
    crawler = fixtures.storiesCrawler();
  });

  afterEach(function() {
    delete crawler;
    mockserver.close();
  });

  it('should crawl things', function(done){
    crawler.once('finish', function(){
      var stats = crawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      assert.equal(stats.nofollowed, 1);
      assert.equal(stats.download.status200, 3);
      assert.equal(stats.download.status404, 1);
      assert.equal(stats.download.disallowedDomain, 2);
      assert.equal(stats.download.blacklisted, 1);
      done();
    });
    crawler.crawl();
  })

  it('should crawl things again', function(done){
    crawler.once('finish', function(item){
      var stats = crawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      done()
    });
    crawler.crawl();
  })

  it('should produce items', function(done){
    crawler.parseField('url', function(response) {
      return response.url;
    });

    var items = [];
    crawler.pipeline(function(item, cb){
      items.push(item);
      cb();
    });

    crawler.once('finish', function(){
      var stats = crawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      assert.equal(items.length, 3);
      done();
    });

    crawler.crawl();
  })

})




