var assert = require("assert");
var roboto = require('../lib/roboto');
var Log = require('log');

var fixtures = require('./fixtures');
var mockserver = null;
var basicCrawler = null;

describe('Happy Path', function(){
  before(function() {
    mockserver = require('./mockserver').createServer(9999);
    basicCrawler = fixtures.storiesCrawler();
  });

  after(function() {
    delete basicCrawler;
    mockserver.close();
  });

  it('should parse items from responses', function(done){
    var itemCount = 0;

    basicCrawler.parseField('url', function(response) {
      return response.url;
    });

    // Increment the count when an item is produced
    basicCrawler.on('item', function(item){
      itemCount += 1;
    });

    // Make assertions once finished
    basicCrawler.once('finish', function(){
      var stats = basicCrawler.stats;
      assert.equal(itemCount, 3);
      done()
    });

    basicCrawler.crawl();
  })

})
