var assert = require("assert");
var moment = require("moment");
var roboto = require('../lib/roboto');
var Log = require('log');

var fixtures = require('./fixtures');
var mockserver = null;
var testCrawler = null;

process.env['NODE_ENV'] = 'test';

describe('Request', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
    testCrawler = fixtures.delayCrawler();
  });
  after(function() {
    delete testCrawler;
    mockserver.close();
  });

  describe('Request Delay', function(){
    this.timeout(10000);
    it('should wait for a user defined delay', function(done){
      var start = moment();

      testCrawler.once('finish', function(){
        var end = moment();
        var diff = end.diff(start);
        assert.equal(this.stats.pagesCrawled, 2);
        assert(diff > 80);
        done();
      });

      testCrawler.crawl();
    });
  });

});
