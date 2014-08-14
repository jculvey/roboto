var assert = require("assert");
var roboto = require('../lib/roboto');
var $ = require('cheerio');

var testCrawler = new roboto.Crawler({
  allowedDomains: [
    'localhost'
  ],
  startUrls: [
    'http://localhost:30045/stories/index.html',
  ],
  blacklist: [
    /accounts/,
  ]
});

describe('Url Normalization', function(){
  var resp = {};
  resp.url = "http://www.foonews.com";

  it('should resolve absolute urls', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = testCrawler._normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  })

  it('should discard query params', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = testCrawler._normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  it('should discard fragments', function(){
    var link = $("<a href='/stories/foo.html#bar'>");
    var actual = testCrawler._normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  //it('Resolve remove extra //', function(){
    //var resp = {};
    //var link = $("<a href='/stories//foo.html'>");
    //resp.url = "http://www.foonews.com";
    //var actual = testCrawler._normalizeUrl(link, resp);
    //var expected = "http://www.foonews.com/stories/foo.html";
    //assert.equal(actual, expected);
  //});

})
