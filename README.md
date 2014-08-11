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

fooCrawler.parseField('title', function(response, $){
  return $('head title').text();
});

fooCrawler.parseField('body', function(response, $){
  var html = $('body').html();
  return html_strip(html);
});

fooCrawler.crawl();
```

## Downloader Middlewares (wip)

These provide extensibility points in roboto's request/response handling.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

## Parser Middlewares (wip)

These provide extensibility points in roboto's handling.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

## Pipeline Middlewares (wip)

These provide extensibility points in roboto's item processing. By default,
parsed items are written to stdout. If you want to do something more interesting 
with your data, you'll need to use pipeline middlewares.

Some examples of pipeline middleware include:
  - Logging items to a file.
  - Storing parsed items in a database.
  - Writing parsed items to a search index.
