var assert = require('assert')
  , createMiddleware = require('../')
  , robotsTxt = require('fs').readFileSync(__dirname + '/fixtures/robots.txt')
  , statSync = require('fs').statSync

describe('robots.txt middleware', function () {

  describe('createMiddleware()', function () {

    it('should throw if `path` is not defined', function () {
      assert.throws(function () {
        createMiddleware()
      })
    })


    it('should throw if a file cannot be read at `path`', function () {
      assert.throws(function () {
        createMiddleware('not a file')
      })
    })


    it('should not throw if a file can be read at `path`', function () {
      assert.doesNotThrow(function () {
        assert.equal(typeof createMiddleware(__dirname + '/fixtures/robots.txt'), 'function')
      })
    })

  })

  describe('middleware()', function () {

    it('should call next if `req.url != "/robots.txt"`', function (done) {
      var req = { url: '/' }
        , res = {}
      createMiddleware(__dirname + '/fixtures/robots.txt')(req, res, function () {
        done()
      })
    })

    it('should respond with the robots.txt file if `req.url = "/robots.txt"`', function (done) {
      var req = { url: '/robots.txt' }
        , res =
          { writeHead: function () {}
          , end: function (d) {
              // deepEqual because these are buffers, not strings
              assert.deepEqual(d, robotsTxt)
              done()
            }
          }
      createMiddleware(__dirname + '/fixtures/robots.txt')(req, res)
    })


    it('should set the "Content-Length" header equal to the file size in bytes', function (done) {
      var req = { url: '/robots.txt' }
        , res =
          { writeHead: function (status, headers) {
              var size = statSync(__dirname + '/fixtures/robots.txt').size
              assert.equal(size, headers['Content-Length'])
              done()
            }
          , end: function () {}
          }
      createMiddleware(__dirname + '/fixtures/robots.txt')(req, res)
    })

  })

})
