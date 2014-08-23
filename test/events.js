var assert = require("assert");
var roboto = require('../lib/roboto');
var fixtures = require('./fixtures');
var mockserver = null;
var crawler = null;

describe('Happy Path', function(){
  beforeEach(function() {
    mockserver = require('./mockserver').createServer(9999);
    crawler = fixtures.storiesCrawler();
  });

  afterEach(function() {
    delete crawler;
    mockserver.close();
  });

  it('should emit httpError events', function(done){
    var num404s = 0;
    crawler.on('httpError', function(statusCode, href, referer) {
      assert.equal(href, 'http://localhost:9999/stories/page3.html');
      assert.equal(referer, 'http://localhost:9999/stories/page1.html');
      if (statusCode === 404) {
        num404s += 1;
      }
    });

    crawler.once('finish', function(){
      assert.equal(num404s, 1);
      done();
    });

    crawler.crawl();
  })

})
