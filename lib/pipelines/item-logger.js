var log = require('../logger');

exports = module.exports = function(options){
  var self = this;
  return function(item, done) {
    log.info('Parsed item:');
    log.info(JSON.stringify(item, null, '  '));
    done();
  };
}
