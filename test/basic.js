var assert = require("assert");
var roboto = require('../lib/roboto');
var Log = require('log');

var fixtures = require('./fixtures');
var mockserver = null;
var basicCrawler = null;

process.env['NODE_ENV'] = 'test';

describe('Happy Path', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
    basicCrawler = fixtures.storiesCrawler();
  });

  after(function() {
    delete testCrawler;
    mockserver.close();
  });

  it('should crawl things', function(done){

    basicCrawler.once('finish', function(){
      var stats = basicCrawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      assert.equal(stats.nofollowed, 1);
      assert.equal(stats.download.status200, 3);
      assert.equal(stats.download.status404, 1);
      assert.equal(stats.download.disallowedDomain, 1);
      assert.equal(stats.download.blacklisted, 1);
      done();
    });
    basicCrawler.crawl();
  })

  it('should crawl things again', function(done){
    basicCrawler.once('finish', function(){
      var stats = basicCrawler.stats;
      assert.equal(stats.pagesCrawled, 3);
      done()
    });
    basicCrawler.crawl();
  })

})




