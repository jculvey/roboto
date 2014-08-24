var assert = require("assert");
var fs = require('fs');
var $ = require('cheerio');
var roboto = require('../lib/roboto');
var UrlFrontier = require('../lib/urlFrontier');
var BotParser = require('../lib/robotsParser');
var Stats = require('../lib/stats');

var botParser = new BotParser({ userAgent: 'roboto-test' });
botParser._fetchRobotsFile = function(domain, done) {
  fs.readFile(__dirname + '/static/robots.txt', 'utf8', function (err, data) {
    done(200, data);
  });
};

var urlFrontier = new UrlFrontier({
  startUrls: [
    'http://www.example.com/foo/bar.html'
  ],
  requestDelay: 0
}, botParser);

describe('Url Frontier', function(){
  it('should initialize from startUrls', function(done) {
    assert.equal(urlFrontier.emptyQueue(), false);
    urlFrontier.getNextLink(function(actual){
      var expected = "http://www.example.com/foo/bar.html";
      assert.equal(actual.href, expected);
      done();
    });
  });

})
