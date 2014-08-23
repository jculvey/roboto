var moment = require('moment');

exports.defaultStats = function defaultStats() {
  var stats = {
    startTime: moment(),
    finishTime: null,
    pagesCrawled: 0,
    nofollowed: 0,
  }
  stats.download = {
    requestCount: 0,
    requestErrors: 0,
    status200: 0,
    status301: 0,
    status302: 0,
    status404: 0,
    disallowedDomain: 0,
    blacklisted: 0,
  }
  return stats;
};
