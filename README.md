Roboto
=======

[![Build Status](https://travis-ci.org/jculvey/roboto.svg?branch=master)](https://travis-ci.org/jculvey/roboto)

Roboto is a node.js crawler framework that you can use to do things like: 
  - Crawl documents in an intranet for search indexing.
  - Crawl an app to check for broken links [(example)](https://github.com/jculvey/roboto/blob/master/examples/deadLinkCrawler.js).
  - General purpose crawling of the web [(news crawler example)](https://github.com/jculvey/roboto/blob/master/examples/top20news.js).
  - Scrape a website for data aggregation [(hackernews example)](https://github.com/jculvey/roboto/blob/master/examples/hackerNews.js).
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
  startUrls: [
    "http://www.foonews.com/latest",
  ],
  allowedDomains: [ // optional
    "foonews.com",
  ]
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
fooCrawler.on('item', function(item) {
  // item = { 
  //    title: 'Foo happened today!', 
  //    body: 'It was amazing', 
  //    url: http://www.foonews.com/latest 
  // }

  database.save(item, function(err) {
    if (err) crawler.log(err);
  });

});

fooCrawler.crawl();
```

For more options, see the [Options Reference](#options-reference).

## Items

For each document roboto crawls, it creates an item. This item will be populated
with fields parsed from the document with parser functions added via `crawler.parseField`.

After a document has been parsed, the crawler will emit an `item` event. You can subscribe to this event like
so:

```js
crawler.on('item', function(item) {
  database.save(item, function(err) {
    if(err) crawler.log(err);
  });
});

// Probably not a wise idea, but for the purpose of illustration:
crawler.on('item', function(item) {
  fs.writeFile(item.filename, item.body, function (err) {
    if (err) crawler.log(err);
  });
});

```

## Pipelines

Pipelines are item processing plugins which you can add to a crawler like so:

```js
crawler.pipeline(somePipeline);
```

### roboto-solr

This pipeline can be used to write extracted items to a solr index.

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

### Create your own.

Creating your own pipeline plugin can make it easeir to share the same item processing
logic across projects. It also lets you share it with others!


The signature of a pipeline function is `function(item, callback)`.  The `callback`
function takes a single argument `err` which should be supplied if an error was encountered. Otherwise,
it should be invoked with no arguments `callback()`.

```js
var myPipeline = function(item, done) {
  log.info(JSON.stringify(item, null, '  '));
  done();
};

myCrawler.pipeline(myPipeline);
```

By default, roboto adds the [`itemLogger` pipeline](https://github.com/jculvey/roboto/blob/master/lib/pipelines/item-logger.js) to
each crawler. This pipeline simply logs the contents of an item using roboto's built-in logger. This can
serve as a good reference point when developing your own pipeline.


## Downloaders

The default downloader can be over-ridden with a downloader plugin. 

### HTTP Authentication

Roboto comes with a downloader plugin that using http authentication in
your crawl requests.

```js
var roboto = require('roboto');
var robotoHttpAuth = roboto.downloaders.httpAuth;

// The options should be the auth hash mentioned here:
//   https://github.com/mikeal/request#http-authentication
httpAuthOptions = {
  rejectUnauthorized: true, // defaults to false
  auth: {
    user: 'bob',
    pass: 'secret'
  }
}
myCrawler.downloader(robotoHttpAuth(httpAuthOptions));

```

### Create your own

You can create a custom downloader and add it to your crawler `downloader` function. 

```js
var _ = require('underscore');

var myDownloader = function(href, requestHandler) {
  var requestOptions = _.extend(this.defaultRequestOptions, {
    url: href
    headers: {
        'X-foo': 'bar'
    }
  });

  request(requestOptions, requestHandler);
};

myCrawler.downloader(myDownloader) {
```
The default request options are available in the `defaultRequestOptions` property of the crawler. 

More information about the structure of `requestOptions` and the signature of `requestHandler` can
be [found here](https://github.com/mikeal/request#requestoptions-callback).


## Url Normalization

Also known as [URL canonicalization](http://en.wikipedia.org/wiki/URL_normalization)

This is the process of reducing syntactically different urls to a common simplified
form. This is useful while crawling to ensure that multiple urls that point to the
same page don't get crawled more than once.

By default roboto normalizes urls with the following procedure:

  - Unescaping url encoding  `/foo/%7Eexample => /foo/~example`
  - Converting relative urls to absolute  `/foo.html => http://example.com/bar.html`
  - Fully resolving paths  `/foo/../bar/baz.html => /bar/baz.html`
  - Discarding fragments  `/foo.html#bar => /foo.html`
  - Discarding query params  `/foo.html#bar => /foo.html`
  - Discarding directory indexes  `/foo/index.html => /foo`
    - index.html, index.php, default.asp, default.aspx are all discarded.
  - Removing mutliple occurrences of '/'  `/foo//bar///baz => /foo/bar/baz`
  - Removing trailing '/'  `/foo/bar/ => /foo/bar`

Discarding query params all together isn't optimal. A planned enhancement is to
sort query params, and possibly detect safe params to remove (sort, rows, etc.).

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

## robots.txt

In addition to the rules outlined above, roboto will also obey directives contained in a domain's `robots.txt` file. 
Directives are parsed [as outlined here](https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt).

If the `robots.txt` file specifies a `Crawl-Delay` directive, that will be given precedence over the
`requestDelay` option passed to the crawler constructor.

You can set the option `obeyRobotsTxt` to `false` in the constructor to disregard the rules in `robots.txt` files:

```js
var fooCrawler = new roboto.Crawler({
  startUrls: [
    "http://www.foonews.com/latest",
  ],
  obeyRobotsTxt: false
});
```

Before roboto crawls an url, it will fetch the domain's `robots.txt` file, parse the directives,
and skip crawling the url if a directive disallows it. The fetched `robots.txt` file is 
is then cached.

Note that roboto will fetch the robots.txt of subdomains. For example, when crawling `http://news.ycombinator.com`,
`http://news.ycombinator.com/robots.txt` will be fetched, not `http://ycombinator.com/robots.txt`.


## Options Reference

The only required option is `startUrls`.

```js
var crawler = new roboto.Crawler({
  startUrls: [
    "http://www.example.com",
  ],
  allowedDomains: [ 
    "example.com",          // subdomains like news.example.com are allowed
  ],
  constrainToRootDomains: true,  // defaults to false
  blacklist: [              // matching urls will be filtered
    /rss/,
    /privacy/,
    /accounts/,
  ],
  whitelist: [              // urls must match one of these to be crawled
    /foo/,
    /bar/,
  ],
  maxDepth: 10,             // Crawled links deeper than this will be filtered. 
  requestDelay: 10,         // delay between requests in ms, defaults to 0
  obeyRobotsTxt: false,     // defaults to true
  allowedContentTypes: [    // These are the defaults
    'text/html',
    'application/xhtml+xml',
    'application/xml'
  ],
  statsDumpInterval: 20     // The page rate at which stats are dumped.
});
```

`constrainToRootDomains` can be used instead of (or in addition to) `allowedDomains`.
If this option is specified, roboto will automatically add the top level domain of
each url in `startUrls` to the list of allowed domains. If you've written a crawler with
many start urls, it can be easier to use this option than to explicitly list each allowed domain.

If no `allowedDomains` have been specified, and `constrainToRootDomains` has been set to false, 
roboto will crawl will add all links to the queue, regardless of domain. This can obviously result
in very large crawls (a large portion of the internet if you pick the right startUrls).

## Logging

Logging is handled by [log.js](https://github.com/visionmedia/log.js), which
is super light weight and very easy to use.

You can access the logger from your crawler. The log level can be set
in the options passed to the Crawler constructor.

```js
var myCrawler = new roboto.Crawler({
  startUrls: [ "http://www.mysite.com" ],
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

## Examples

Available [here](https://github.com/jculvey/roboto/tree/master/examples).

  - [Crawl an app to check for broken links](https://github.com/jculvey/roboto/blob/master/examples/deadLinkCrawler.js).
  - [Crawl the top 20 news sites according to Alexa)](https://github.com/jculvey/roboto/blob/master/examples/top20news.js).
  - [Crawl Hacker News](https://github.com/jculvey/roboto/blob/master/examples/hackerNews.js).

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

## Roadmap

Currently planned features:
  - Domain clumping avoidance.
  - Pause and resume.
  - More pipelines (.csv, elastic-search, mongo)
  - Built-in caching (alternative to a caching proxy like Squid).
  - Site map handling.

Feel free to create an issue if there's a feature you'd like to see or a bug you
want fixed :)

