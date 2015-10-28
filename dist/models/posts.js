'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMongo = require('../lib/mongo');

var _libMongo2 = _interopRequireDefault(_libMongo);

exports['default'] = _libMongo2['default'].collection('posts');
module.exports = exports['default'];