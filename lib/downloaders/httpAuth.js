var request = require('request');

exports = module.exports = function(options){
  return function(href, requestHandler) {
    var requestOptions = {
      url: href,
      method: 'GET',
      auth: options
    }

    request(requestOptions, requestHandler);
  }
}
