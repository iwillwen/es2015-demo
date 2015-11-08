'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongo = require('../lib/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _mongo2.default.collection('posts');