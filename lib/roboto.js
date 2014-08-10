var EventEmitter = require('events').EventEmitter;
var mixin = require('utils-merge');
//var proto = require('./bot');
var Crawler = require('./crawler');

//exports = module.exports = createBot;

//function createBot(){
  //var bot = function(name) {
  //}
  //mixin(bot, proto);
  //mixin(bot, EventEmitter.prototype);

  //bot.init();
  //return bot;
//}

exports = module.exports = {};

// Expose built in middleware
exports.itemLogger = require('./pipelines/item-logger');
exports.Crawler = Crawler;

//parseResponse
// for middleware in parse middleware
