exports = module.exports = function(options){
  return function(item) {
    options.log.info('Parsed item:');
    options.log.info(JSON.stringify(item, null, '  '));
  };
}
