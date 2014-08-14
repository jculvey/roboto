var express = require('express');
var app = express();

//app.get('/timeout', function(req, res){
  //setTimeout(function() {
    //res.send('<html><body>ok</body></html>');
  //},req.param("timeout") || 0);
//});

app.use(express.static(__dirname, '/stories'));

exports.app = app;

if (require.main === module) {
  app.listen(9090);
}
