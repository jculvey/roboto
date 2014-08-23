var assert = require("assert");
var roboto = require('../lib/roboto');
var LinkExtractor = require('../lib/linkExtractor');
var Stats = require('../lib/stats');
var $ = require('cheerio');

var linkExtractor = new LinkExtractor({
  allowedDomains: [
    'example.com'
  ],
  whitelist: [
    /\/good\//,
  ],
  blacklist: [
    /\/bad\//,
  ],
  allowedContentTypes: [
    'text/html',
    'application/xhtml+xml',
    'application/xml'
  ],
  allowedSchemes: [ 'http', 'https' ],
}, Stats.defaultStats());

describe('Url Normalization', function(){
  var resp = {};
  resp.url = "http://www.foonews.com";

  it('should resolve absolute urls', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  })

  it('should discard query params', function(){
    var link = $("<a href='/stories/foo.html'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  it('should discard fragments', function(){
    var link = $("<a href='/stories/foo.html#bar'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.foonews.com/stories/foo.html";
    assert.equal(actual, expected);
  });

  it('should decode percent encoded octets', function(){
    var link = $("<a href='http://www.example.com/%7Eusername'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com/~username";
    assert.equal(actual, expected);
  });

  it('should decode lowercased encoded octets', function(){
    var link = $("<a href='http://www.example.com/%7eusername'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com/~username";
    assert.equal(actual, expected);
  });

  it('should lowercase protocol and host', function(){
    var link = $("<a href='HTTP://www.Example.com'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com";
    assert.equal(actual, expected);
  });

  it('should remove the default port', function(){
    var link = $("<a href='http://www.example.com:80'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com";
    assert.equal(actual, expected);
  });

  it('should fully resolve paths', function(){
    var link = $("<a href='http://www.example.com/foo/../bar/baz.html'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com/bar/baz.html";
    assert.equal(actual, expected);
  });

  it('should remove trailing slash', function(){
    var link = $("<a href='http://www.example.com/foo/'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com/foo";
    assert.equal(actual, expected);
  });

  it('should remove directory index', function(){
    var expected = "http://www.example.com/foo";

    var link = $("<a href='http://www.example.com/foo/index.html'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/index.php'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/default.asp'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    assert.equal(actual, expected);

    var link = $("<a href='http://www.example.com/foo/default.aspx'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    assert.equal(actual, expected);
  });

  it('should remove extra /', function(){
    var link = $("<a href='http://www.example.com//foo/bar///baz.html'>");
    var actual = linkExtractor.normalizeUrl(link, resp);
    var expected = "http://www.example.com/foo/bar/baz.html";
    assert.equal(actual, expected);
  });

})

describe('Url Disallow', function(){

  it('should enforce blacklist', function(){
    var url = "http://www.example.com/bad/foo.html";
    assert(!linkExtractor._allowedUrl(url));
  });

  it('should enforce whitelist', function(){
    var url = "http://www.example.com/good/foo.html";
    assert(linkExtractor._allowedUrl(url));
  });

  it('should obey allowed domains', function(){
    assert(linkExtractor._allowedUrl("http://www.example.com/good/foo.html"));
    assert(!linkExtractor._allowedUrl("http://www.bad.com/good/foo.html"));
    assert(linkExtractor._allowedUrl("http://news.example.com/good/foo.html"));
  });

})
