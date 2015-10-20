'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _thunkify = require('thunkify');

var _thunkify2 = _interopRequireDefault(_thunkify);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _koaMiddlewares = require('koa-middlewares');

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _libLeancloud = require('./lib/leancloud');

var _libLeancloud2 = _interopRequireDefault(_libLeancloud);

var app = (0, _koa2['default'])();
app.use(function* (next) {
  var _this = this;

  _libLeancloud2['default'].Cloud.handle(this.req, this.res, function () {
    if (_this.res._headerSent) _this.status = 200;
    (0, _co2['default'])(function* () {
      console.log(this.res);
      yield next;
    });
  });
});
app.use((0, _koaStatic2['default'])(_path2['default'].resolve(__dirname, './public')));
app.use((0, _koaMiddlewares.bodyParser)());
app.use(_routes2['default'].routes());

exports['default'] = app;
module.exports = exports['default'];