Roboto
=====

A work in progress.

Roboto is a crawler for nodejs. 

## Overview

Roboto can be used to quickly create a crawler. Some examples of what it can
accomplish are:
  - Crawling documents in an intranet for search indexing.
  - Scraping a website for data aggregation.
  - Crawling an app to check for broken links.
  - General purpose crawling of the web.

You are responsible for what you do. If you use roboto in violation of a site's 
terms of service, you do so at your own risk.

## Installation

```bash
  $ npm install -g roboto
  $ roboto /tmp/newsbot && cd /tmp/newsbot
  $ npm install
```

## Basic Usage 

Here's an example of roboto being used to crawl a fictitious news site:

```js
var newsbot = roboto();

var fooCrawler = new roboto.Crawler({
  id: 'foo',
  start_urls: [
    "http://www.foonews.com/latest",
  ],
  allowed_domains: [
    "foonews.com",
  ]
});

fooCrawler.pipeline(itemLogger);

newsbot.addCrawler('foo', fooCrawler);
```

To launch the crawler, you can use the command line `roboto` utility:

```bash
  $ roboto crawl foo
```

or programatically, like so:

```js
newsbot.crawl('foo');
```

## Downloader Middlewares

These provide extensibility points in roboto's request/response handling.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.

## Parser Middlewares

These provide extensibility points in roboto's ndling.

Downloader middleware can be used to accomplish the following:
  - Filtering out requests to already seen urls.
  - Storing requests in a cache to avoid repeat visits across crawl sessions.
  - Use HTTP Authentication when making requests.


## Pipeline Middlewares

These provide extensibility points in roboto's item processing. By default,
parsed items are written to stdout. If you want to do something more interesting 
with your data, you'll need to use pipeline middlewares.

Some examples of pipeline middleware include:
  - Logging items to a file.
  - Storing parsed items in a database.
  - Writing parsed items to a search index.

## FAQ

Q: Really?
A: Yes.
=======
roboto
======
