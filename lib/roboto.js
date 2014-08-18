var Crawler = require('./crawler');

exports = module.exports = {};

// Expose built-in plugins
exports.downloaders = {};
exports.downloaders.httpAuth = require('./downloaders/httpAuth');
exports.pipelines = {};
exports.pipelines.robotoSolr = require('./pipelines/roboto-solr');

exports.robotsParser = require('./robotsParser');

exports.Crawler = Crawler;
