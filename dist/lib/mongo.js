'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _monk = require('monk');

var _monk2 = _interopRequireDefault(_monk);

var _coMonk = require('co-monk');

var _coMonk2 = _interopRequireDefault(_coMonk);

var _config = require('../../config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = (0, _monk2.default)(_config2.default.dbs.mongo);

/**
 * 返回 MongoDB 中的 Collection 實例
 * 
 * @param  {String} name collection name
 * @return {Object}      Collection
 */
function collection(name) {
  return (0, _coMonk2.default)(db.get(name));
}

exports.default = {
  collection: collection
};