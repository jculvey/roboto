module.exports = createMiddleware

var readFileSync = require('fs').readFileSync
  , crypto = require('crypto')

function createMiddleware(path, options) {

  // Defaults
  options = options || {}

  if (!path) throw new Error('No path provided for robots.txt file')

  var maxAge = options.maxAge || 86400000
    , txt = readFileSync(path)
    , headers =
      { 'Content-Type': 'text/plain'
      , 'Content-Length': txt.length
      , 'ETag': '"' + crypto.createHash('md5').update(txt) + '"'
      , 'Cache-Control': 'public, max-age=' + (maxAge / 1000)
      }

  return function middleware(req, res, next) {
    if ('/robots.txt' !== req.url) return next()
    res.writeHead(200, headers)
    res.end(txt)
  }

}
