'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _monk = require('monk');

var _monk2 = _interopRequireDefault(_monk);

var _coMonk = require('co-monk');

var _coMonk2 = _interopRequireDefault(_coMonk);

var _configJson = require('../../config.json');

var _configJson2 = _interopRequireDefault(_configJson);

var db = (0, _monk2['default'])(_configJson2['default'].dbs.mongo);

function collection(name) {
  return (0, _coMonk2['default'])(db.get(name));
}

exports['default'] = {
  collection: collection
};
module.exports = exports['default'];