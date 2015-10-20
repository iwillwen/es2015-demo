'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _koaMiddlewares = require('koa-middlewares');

var _controllersPosts = require('./controllers/posts');

var _controllersPosts2 = _interopRequireDefault(_controllersPosts);

var router = new _koaMiddlewares.router();
router.get('/api/posts/list', _controllersPosts2['default'].get.listPosts);
router.get('/api/posts/:id', _controllersPosts2['default'].get.getPost);

exports['default'] = router;
module.exports = exports['default'];