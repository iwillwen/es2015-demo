'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _koaMiddlewares = require('koa-middlewares');

var _controllersPosts = require('./controllers/posts');

var _controllersPosts2 = _interopRequireDefault(_controllersPosts);

var _controllersComments = require('./controllers/comments');

var _controllersComments2 = _interopRequireDefault(_controllersComments);

var router = new _koaMiddlewares.router();

// Posts
router.get('/api/posts/list', _controllersPosts2['default'].get.listPosts);
router.get('/api/posts/:id', _controllersPosts2['default'].get.getPost);
router.post('/api/posts/new', _controllersPosts2['default'].post.newPost);

// Comments
router.get('/api/comments/post/:id', _controllersComments2['default'].get.fetchCommentsInPost);
router.post('/api/comments/post', _controllersComments2['default'].post.postComment);

exports['default'] = router;
module.exports = exports['default'];