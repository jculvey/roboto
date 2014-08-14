var mockserver = require('./mockserver').app.listen(9999);

var assert = require("assert");
var roboto = require('../lib/roboto');
var $ = require('cheerio');

var testCrawler = new roboto.Crawler({
  allowedDomains: [
    'localhost'
  ],
  startUrls: [
    'http://localhost:9999/stories/index.html',
  ],
  blacklist: [
    /accounts/,
  ]
});

// TODO: Make this work
var Log = require('log');
//testCrawler.log = {
  //error: noop,
  //warning: noop,
  //notice: noop,
  //info: noop,
  //debug: noop,
//};


if (require.main === module) {
  var log = new Log('debug');
  testCrawler.log = log;
  testCrawler.crawl();

  testCrawler.on('finish', function(){
    mockserver.close();
  });
}
else {
  var log = new Log('critical');
  testCrawler.log = log;
  describe('Happy Path', function(){
    it('should crawl things', function(done){
      testCrawler.crawl();

      testCrawler.on('finish', function(){
        var stats = testCrawler.stats;
        assert.equal(stats.pagesCrawled, 3);
        // 3 total, one on each page
        assert.equal(stats.nofollowed, 1);
        assert.equal(stats.download.status200, 3);
        assert.equal(stats.download.status404, 1);
        assert.equal(stats.download.disallowedDomain, 1);
        assert.equal(stats.download.blacklisted, 1);

        mockserver.close();
        done();
      });

    })
  })
}




