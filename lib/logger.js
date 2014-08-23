/* Log level reference
0 EMERGENCY system unusable
1 ALERT immediate action required
2 CRITICAL condition critical
3 ERROR condition error
4 WARNING condition warning
5 NOTICE condition normal, but significant
6 INFO a purely informational message
7 DEBUG debugging information
*/

var Log = require('log');
var log = null;

module.exports = exports = new Log(process.env['LOG_LEVEL'] || 'info');
