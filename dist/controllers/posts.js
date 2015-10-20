'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libLeancloud = require('../lib/leancloud');

var _libLeancloud2 = _interopRequireDefault(_libLeancloud);

var Post = _libLeancloud2['default'].Object.extend('Posts');
var Posts = _libLeancloud2['default'].Collection.extend({
  model: Post
});

var router = {
  get: {}
};

// GET /api/posts/list
router.get.listPosts = function* () {
  var page = parseInt(this.query.page || 0);
  var count = 10;

  var query = new _libLeancloud2['default'].Query(Post);
  query.descending('created_at');
  query.skip(page * count);
  query.limit(count);
  var posts = yield query.find();

  this.body = {
    posts: posts
  };
};

// GET /api/posts/:id
router.get.getPost = function* () {
  var id = this.params.id;

  var query = new _libLeancloud2['default'].Query(Post);
  var post = yield query.get(id);

  this.body = {
    post: post
  };
};

exports['default'] = router;
module.exports = exports['default'];