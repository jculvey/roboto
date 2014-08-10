var Crawler = require('./crawler');

exports = module.exports = {};

// Expose built in middleware
exports.itemLogger = require('./pipelines/item-logger');
exports.Crawler = Crawler;
