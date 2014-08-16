var assert = require("assert");
var roboto = require('../lib/roboto');
var Log = require('log');

var mockserver = null;

describe('Happy Path', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
  });

  after(function() {
    mockserver.close();
  });

  describe('crawling', function(){
    var log = new Log('critical');
    var basicCrawler = new roboto.Crawler({
      allowedDomains: [ 'localhost' ],
      startUrls: [
        'http://localhost:9999/stories/index.html',
      ],
      blacklist: [
        /accounts/,
      ]
    });
    basicCrawler.log = log;

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
})




