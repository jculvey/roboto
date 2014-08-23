var fs = require('fs');
var assert = require("assert");
var async = require('async');
var roboto = require('../lib/roboto');
var BotParser = require('../lib/robotsParser');

// Mock the robots.txt fetch
var botParser = new BotParser({ userAgent: 'roboto-test' });
botParser._fetchRobotsFile = function(domain, done) {
  fs.readFile(__dirname + '/static/robots.txt', 'utf8', function (err, data) {
    done(200, data);
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
      'http://localhost:9999/folder/page',
      'http://localhost:9999/page',
      'http://localhost:9999/Fish.asp',
      'http://localhost:9999/catfish',
      'http://localhost:9999/?id=fish',
      'http://localhost:9999/Fish/Salmon.asp',
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
      'http://localhost:9999/fish',
      'http://localhost:9999/fish.html',
      'http://localhost:9999/fish/salmon.html',
      'http://localhost:9999/fishheads',
      'http://localhost:9999/fishheads/yummy.html',
      'http://localhost:9999/fish.php?id=anything',
      'http://localhost:9999/fish/',
      'http://localhost:9999/fish/?id=anything',
      'http://localhost:9999/fish/salmon.htm',
    ];

    // All of the test urls should be filtered
    async.filter(badUrls, botParser.allowed.bind(botParser), function(res) {
      assert.equal(res.length, 0);
      done();
    });
  })

  it('should fail gracefull on a bad parse', function(done){
    botParser._fetchRobotsFile = function(domain, done) {
      fs.readFile(__dirname + '/static/badRobots.txt', 'utf8', function (err, data) {
        done(200, data);
      });
    };

    // All of the test urls should be filtered
    botParser.allowed('http://localhost:9999/foo/bar.html', function(allowed) {
      assert.equal(allowed, false);
      done();
    });
  })


})




