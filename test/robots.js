var fs = require('fs');
var assert = require("assert");
var async = require('async');
var roboto = require('../lib/roboto');
var BotParser = require('../lib/robotsParser');

// Mock the robots.txt fetch
var botParser = new BotParser({ userAgent: 'roboto-test' });
botParser._fetchRobotsFile = function(domain, done) {
  fs.readFile(__dirname + '/static/robots.txt', 'utf8', function (err, data) {
    done(data);
  });
};

// Many test cases are derived from: 
// - https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt
describe('Robots Parser', function(){

  it('should allow urls without a disallow rule', function(done){
    var goodUrls = [
      'http://localhost:9999/',
      'http://localhost:9999/foo.html',
      'http://localhost:9999/ajax/foo',
      'http://example.com/folder/page',
      'http://example.com/page',
      'http://example.com/Fish.asp',
      'http://example.com/catfish',
      'http://example.com/?id=fish',
      'http://example.com/Fish/Salmon.asp',
    ];

    // None of the test urls should be filtered
    async.filter(goodUrls, botParser.allowed.bind(botParser), function(res) {
      assert.equal(res.length, goodUrls.length);
      done();
    });
  })

  it('should disallow urls without a disallow rule', function(done){
    var badUrls = [
      'http://localhost:9999/foo/bar.html',
      'http://localhost:9999/search?q=foo+bar+baz&fq=quux',
      'http://localhost:9999/ads/foo',
      'http://example.com/fish',
      'http://example.com/fish.html',
      'http://example.com/fish/salmon.html',
      'http://example.com/fishheads',
      'http://example.com/fishheads/yummy.html',
      'http://example.com/fish.php?id=anything',
      'http://example.com/fish/',
      'http://example.com/fish/?id=anything',
      'http://example.com/fish/salmon.htm',
    ];

    // All of the test urls should be filtered
    async.filter(badUrls, botParser.allowed.bind(botParser), function(res) {
      assert.equal(res.length, 0);
      done();
    });
  })

})




