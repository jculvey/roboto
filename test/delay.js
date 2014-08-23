var assert = require("assert");
var moment = require("moment");
var roboto = require('../lib/roboto');
var fixtures = require('./fixtures');
var mockserver;
var crawler;

describe('Depth control', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
    crawler = new roboto.Crawler({
      requestDelay: 40,
      allowedDomains: [ 'localhost' ],
      startUrls: [
        'http://localhost:9999/static/delay/index.html',
      ]
    });
  });
  after(function() {
    delete crawler;
    mockserver.close();
  });

  describe('Request Delay', function(){
    this.timeout(10000);
    it('should wait for a user defined delay', function(done){
      var start = moment();

      crawler.once('finish', function(){
        var end = moment();
        var diff = end.diff(start);
        assert.equal(this.stats.pagesCrawled, 2);
        assert(diff > 80);
        done();
      });

      crawler.crawl();
    });
  });

});
