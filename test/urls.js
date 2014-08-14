var assert = require("assert");
var roboto = require('../lib/roboto');
var $ = require('cheerio');

var testCrawler = new roboto.Crawler({
  allowedDomains: [
    'example.com'
  ],
  whitelist: [
    /\/good\//,
  ],
  blacklist: [
    /\/bad\//,
  ]
});

describe('Url Normalization', function(){
  var resp = {};
  resp.url = "http://www.foonews.com";

  it('should resolve absolute urls', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  })

  it('should discard query params', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  it('should discard fragments', function(){
    var link = $("<a href='/stories/foo.html#bar'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  it('should decode percent encoded octets', function(){
    var link = $("<a href='http://www.example.com/%7Eusername'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com/~username";
    assert.equal(actual, expected);
  });

  it('should decode lowercased encoded octets', function(){
    var link = $("<a href='http://www.example.com/%7eusername'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com/~username";
    assert.equal(actual, expected);
  });

  it('should lowercase protocol and host', function(){
    var link = $("<a href='HTTP://www.Example.com'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com";
    assert.equal(actual, expected);
  });

  it('should remove the default port', function(){
    var link = $("<a href='http://www.example.com:80'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com";
    assert.equal(actual, expected);
  });

  it('should fully resolve paths', function(){
    var link = $("<a href='http://www.example.com/foo/../bar/baz.html'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com/bar/baz.html";
    assert.equal(actual, expected);
  });

  it('should remove trailing slash', function(){
    var link = $("<a href='http://www.example.com/foo/'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com/foo";
    assert.equal(actual, expected);
  });

  it('should remove directory index', function(){
    var expected = "http://www.example.com/foo";

    var link = $("<a href='http://www.example.com/foo/index.html'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/index.php'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/default.asp'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/default.aspx'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    assert.equal(actual, expected);
  });

  it('should remove extra /', function(){
    var link = $("<a href='http://www.example.com//foo/bar///baz.html'>");
    var actual = testCrawler.normalizeUrl(link, resp);
    var expected = "http://www.example.com/foo/bar/baz.html";
    assert.equal(actual, expected);
  });

})

describe('Url Disallow', function(){

  it('should enforce blacklist', function(){
    var url = "http://www.example.com/bad/foo.html";
    assert(!testCrawler._allowedUrl(url));
  });

  it('should enforce whitelist', function(){
    var url = "http://www.example.com/good/foo.html";
    assert(testCrawler._allowedUrl(url));
  });

  it('should obey allowed domains', function(){
    var url = "http://www.example.com/good/foo.html";
    assert(testCrawler._allowedUrl(url));
  });

})
