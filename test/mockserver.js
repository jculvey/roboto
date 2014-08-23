var express = require('express');
var robots = require('robots.txt')

//app.get('/timeout', function(req, res){
  //setTimeout(function() {
    //res.send('<html><body>ok</body></html>');
  //},req.param("timeout") || 0);
//});

function createServer(port) {
  var app = express();


  app.use(robots(__dirname + '/static/robots.txt'))
  app.use('/stories', express.static(__dirname + '/static/stories'));
  app.use('/static', express.static(__dirname + '/static'));
  return app.listen(port);
};

exports.createServer = createServer;

if (require.main === module) {
  createServer(9090);
}
