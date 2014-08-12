Roboto
=====

Roboto is a crawler for nodejs. 

You can use roboto to create crawlers that do things like: 
  - crawl documents in an intranet for search indexing.
  - scrape a website for data aggregation.
  - crawl an app to check for broken links.
  - general purpose crawling of the web.

## Installation

```bash
  $ npm install roboto
```

## Basic Usage 

Here's an example of roboto being used to crawl a fictitious news site:

```js
var roboto = require('roboto');
var html_strip = require('htmlstrip-native').html_strip;

var fooCrawler = new roboto.Crawler({
  start_urls: [
    "http://www.foonews.com/latest",
  ],
  allowed_domains: [
    "foonews.com",
  ],
  blacklist: [
    /rss/,
    /privacy/,
    /accounts/,
  ],
  whitelist: [
    /foo/,
    /bar/,
  ],
});

// Add parsers to the crawler.
// Each will parse a data item from the response
fooCrawler.parseField('title', function(response, $){
  return $('head title').text();
});

// $ is a cherio selector loaded with the response body.
// Use it like you would jquery.
// See https://github.com/cheeriojs/cheerio for more info.
fooCrawler.parseField('body', function(response, $){
  var html = $('body').html();
  return html_strip(html);
});

// response has a few attributes from 
// http://nodejs.org/api/http.html#http_http_incomingmessage
fooCrawler.parseField('url', function(response, $){
  return response.url;
});

// Do something with the items you parse
fooCrawler.on('item', function(item){
  database.save(item);
  // item = { 
  //    title: 'Foo happened today!', 
  //    body: 'It was amazing', 
  //    url: http://www.foonews.com/latest 
  // }
});

fooCrawler.crawl();
```

## Downloaders

These provide extensibility points in roboto's request/response handling.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

### HTTP Authentication

```js
var roboto = require('roboto');
var robotoHttpAuth = roboto.downloaders.httpAuth;

// The options should be the auth hash mentioned here:
//   https://github.com/mikeal/request#http-authentication
httpAuthOptions = {
  user: 'bob',
  pass: 'secret'
}
myCrawler.downloader(robotoHttpAuth(httpAuthOptions));

```

## Link Extractors

These provide extensibility points in roboto's link extraction.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

## Pipelines

These provide extensibility points in roboto's item processing. By default,
parsed items are written to stdout. If you want to do something more interesting 
with your data, you'll need to use pipeline middlewares.

Some examples of pipeline middleware include:
  - Logging items to a file.
  - Storing parsed items in a database.
  - Writing parsed items to a search index.

## Logging

Logging is handled by [log.js](https://github.com/visionmedia/log.js), which
is super light weight and very easy to use.

You can access the logger from your crawler. The log level can be set
in the options passed to the Crawler constructor.

```js
var myCrawler = new roboto.Crawler({
  start_urls: [ "http://www.mysite.com" ],
  logLevel: 'debug'
});

// Logging methods, by priority
myCrawler.log.emergency('Something caught fire.');
myCrawler.log.alert('Something catastrophic happened.');
myCrawler.log.critical('Something terrible happened.');
myCrawler.log.error('Something bad happened.');
myCrawler.log.warning('Something alarming happened.');
myCrawler.log.notice('Something noticeable happened.');
myCrawler.log.info('Something happened.');
myCrawler.log.debug('Something happened here.');
```
