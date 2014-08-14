var express = require('express');
var robots = require('robots.txt')

var app = express();

app.use(robots(__dirname + '/static/robots.txt'))
app.use('/stories', express.static(__dirname + '/static/stories'));
app.use('/static', express.static(__dirname + '/static'));

//app.get('/timeout', function(req, res){
  //setTimeout(function() {
    //res.send('<html><body>ok</body></html>');
  //},req.param("timeout") || 0);
//});

exports.app = app;

if (require.main === module) {
  app.listen(9090);
}
