'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaMiddlewares = require('koa-middlewares');

var _posts = require('./controllers/posts');

var _posts2 = _interopRequireDefault(_posts);

var _comments = require('./controllers/comments');

var _comments2 = _interopRequireDefault(_comments);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _koaMiddlewares.router();

// Posts
router.get('/api/posts/list', _posts2.default.get.listPosts);
router.get('/api/posts/:id', _posts2.default.get.getPost);
router.post('/api/posts/new', _posts2.default.post.newPost);

// Comments
router.get('/api/comments/post/:id', _comments2.default.get.fetchCommentsInPost);
router.post('/api/comments/post', _comments2.default.post.postComment);

exports.default = router;