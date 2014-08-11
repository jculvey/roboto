var Crawler = require('./crawler');

exports = module.exports = {};

// Expose built in middleware
exports.downloaders = {};
exports.downloaders.httpAuth = require('./downloaders/httpAuth');

exports.Crawler = Crawler;
