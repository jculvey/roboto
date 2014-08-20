var solr = require('solr');
var _ = require('underscore');

exports = module.exports = function(options){

  // Reasonable defaults
  var options = _.extend({
    host: '127.0.0.1',
    port: '8983',
    core: '/collection1', // if defined, should begin with a slash
    path: '/solr', // should also begin with a slash
    fieldMap: {}
  }, options);

  return function(item, done) {
    try {
      var solrClient = solr.createClient({
        host: options.host,
        port: options.port,
        core: options.core,
        path: options.path
      });
    }
    catch(err) {
      done(err);
    }

    var doc = {};
    _.each(item, function(value, key) {
      // If a field mapping exists, use that field name instead
      var mappedFieldName = options.fieldMap[key];
      if (mappedFieldName) {
        doc[mappedFieldName] = value;
      }
      else {
        doc[key] = value;
      }
    });

    solrClient.add(doc, function(err) {
      if (err) {
        done(err);
      }
      else {
        solrClient.commit();
        done();
      }
    });

  };
}
