var assert = require("assert");
var moment = require("moment");
var roboto = require('../lib/roboto');
var Log = require('log');

var mockserver = null;

describe('Request', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
  });
  after(function() {
    mockserver.close();
  });

  var log = new Log('critical');
  var testCrawler = new roboto.Crawler({
    requestDelay: 40,
    allowedDomains: [ 'localhost' ],
    startUrls: [
      'http://localhost:9999/static/delay/index.html',
    ]
  });
  testCrawler.log = log;

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
