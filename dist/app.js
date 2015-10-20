'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koaMiddlewares = require('koa-middlewares');

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var app = (0, _koa2['default'])();
app.use((0, _koaStatic2['default'])(_path2['default'].resolve(__dirname, './public')));
app.use((0, _koaMiddlewares.bodyParser)());
app.use(_routes2['default'].routes());

var PORT = parseInt(process.env.PORT || 3000);
app.listen(PORT, function () {
  console.log('Demo is running, port:' + PORT);
});