var assert = require("assert");
var moment = require("moment");
var roboto = require('../lib/roboto');
var fixtures = require('./fixtures');
var mockserver;
var crawler;

describe('Request', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
    crawler = new roboto.Crawler({
      startUrls: [
        'http://localhost:9999/static/depth/index.html',
      ],
      allowedDomains: [ 'localhost' ],
      maxDepth: 2
    });
  });
  after(function() {
    delete crawler;
    mockserver.close();
  });

  describe('maxDepth option', function(){
    it('should not crawl pages deeper than maxDepth', function(done){
      crawler.once('finish', function(item){
        var stats = crawler.stats;
        assert.equal(stats.pagesCrawled, 3);
        done()
      });
      crawler.crawl();
    });
  });


});
