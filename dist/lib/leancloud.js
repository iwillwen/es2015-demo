'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _leanengine = require('leanengine');

var _leanengine2 = _interopRequireDefault(_leanengine);

var APP_ID = process.env.LC_APP_ID || '1FyJrNv3YTh0gJgh1gmwfx1c';
var APP_KEY = process.env.LC_APP_KEY || '9xkimPSEA880LJvNj3SmvrNx';
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || 'sw8kMfNc8apR1RxK5RbPVuaC';

_leanengine2['default'].initialize(APP_ID, APP_KEY, MASTER_KEY);

exports['default'] = _leanengine2['default'];
module.exports = exports['default'];