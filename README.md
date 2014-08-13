Roboto
=====

Roboto is a node.js crawler framework that you can use to do things like: 
  - Crawl documents in an intranet for search indexing.
  - Scrape a website for data aggregation.
  - Crawl an app to check for broken links.
  - General purpose crawling of the web.
  - Much more!

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
fooCrawler.pipeline(function(item) {
  database.save(item);
  // item = { 
  //    title: 'Foo happened today!', 
  //    body: 'It was amazing', 
  //    url: http://www.foonews.com/latest 
  // }
});

fooCrawler.crawl();
```

## Pipelines

For each document roboto crawls, it creates an item. This item will be populated
with fields parsed from the document with parser functions added via `crawler.parseField`.

After a document has been parsed, a crawler's pipelines will be invoked in the order
in which they were added.

To do something more useful with your data, you'll want to use pipelines.

Pipleines can be added to your crawler like this:

```js
fooCrawler.pipeline(function(item) {
  database.save(item);
  // item = { 
  //    title: 'Foo happened today!', 
  //    body: 'It was amazing', 
  //    url: http://www.foonews.com/latest 
  // }
});
```

Roboto provides some useful built-in pipelines.

### roboto-solr

This can be used to write extracted items to a solr index.

A `fieldMap` can be specified in the options of the constructor to
change the key of an item as it is stored in solr.

In the following example, the crawler is parsing a `'url'` field
which will be stored in the solr index as `'id'`

```js
var robotoSolr = roboto.pipelines.robotoSolr({
  host: '127.0.0.1',
  port: '8983',
  core: '/collection1', // if defined, should begin with a slash
  path: '/solr', // should also begin with a slash
  fieldMap: {
    'url': 'id',
    'body': 'content_t'
  }
});

myCrawler.pipeline(robotoSolr);
```

## Downloaders

The default downloader can be over-ridden with something custom. For example, you can
use a custom downloader to:
  - Cache requests to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

You can use a custom downloader by adding one via the `crawler.donwloader` function:

```js

myCrawler.downloader(function(href, requestHandler) {
  var requestOptions = {
    url: href,
    headers: {
        'X-foo': 'bar'
    }
  });

  request(requestOptions, requestHandler);
})
```

The signature of `requestHandler` should match that of the 
[request callback](https://github.com/mikeal/request#requestoptions-callback)
mentioned here.

### HTTP Authentication

Roboto provides a built-in downloader for using http authentication in
your crawl requests.

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

## Link Extraction

By default, roboto will extract all links from a page and add them
onto the queue of pages to be crawled unless they:

 - Don't contain an `href` attribute.
 - Have `rel="nofollow"` or `rel="noindex"`.
 - Don't belong to a domain listed in the crawler's `allowedDomains` list.
 - Match a rule on the crawler's `blacklist`.
 - Don't match a rule on the crawler's `whitelist`.
 - Have already been crawled

Also, pages will not be processed if the page's `<head>` contains a tag like:

```html
  <meta name="robots">nofollow</meta>

```

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

## Alternatives

[Scrapy](http://doc.scrapy.org/en/latest/) is an awesome python framework for scraping/crawling. It's fairly
mature and has a good feature set. It's a good option if your looking to do something like this in python. If 
you're familiar with scrapy, many of roboto's concepts may seem familiar.

A couple of annoyances led me to look for alternatives to scrapy:
  - No handling for 'nofollow' out of the box
  - Link extraction is overly complicated
  - Bulky xml libraries
  - My day job is a web developer, so I want jQuery like DOM manipulation. (you suck xpath)

[Nutch](http://nutch.apache.org/) is a popular off the shelf crawler. It's mature and 
full featured like Lucene and Solr. 

Java and xml make me sad though :( 

## Roadmap

Currently planned features:
  - Throttling
  - More pipelines (.csv, elastic-search, etc)
  - Built-in caching (alternative to a caching proxy like Squid).
  - Full adherance to robots.txt standards.
  - Site map handling.

Feel free to create an issue if there's a feature you'd like to see or a bug you
want fixed :)







