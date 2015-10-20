'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _distLibLeancloud = require('./dist/lib/leancloud');

var _distLibLeancloud2 = _interopRequireDefault(_distLibLeancloud);

var _distApp = require('./dist/app');

var _distApp2 = _interopRequireDefault(_distApp);

var PORT = parseInt(process.env.LC_APP_PORT || 3000);
_distApp2['default'].listen(PORT, function () {
  console.log('Node app is running, port:', PORT, '\n\n\n\n\n\n');
});