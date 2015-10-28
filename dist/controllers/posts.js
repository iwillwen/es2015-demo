'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _thunkify = require('thunkify');

var _thunkify2 = _interopRequireDefault(_thunkify);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _modelsPosts = require('../models/posts');

var _modelsPosts2 = _interopRequireDefault(_modelsPosts);

var requestAsync = (0, _thunkify2['default'])(function (opts, callback) {
  (0, _request2['default'])(opts, function (err, res, body) {
    return callback(err, body);
  });
});

var router = {
  get: {},
  post: {}
};

// GET /api/posts/list
router.get.listPosts = function* () {
  var page = parseInt(this.query.page || 0);
  var count = 10;

  var _posts = yield _modelsPosts2['default'].find({}, {
    skip: page * count,
    limit: count
  });

  _posts = yield _posts.map(function (post) {
    return function* () {
      var duoshuoReply = JSON.parse((yield requestAsync('http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=' + post._id + '&page=0&limit=1000')));

      var commentsId = Object.keys(duoshuoReply.parentPosts);
      post.comments = commentsId.map(function (id) {
        return duoshuoReply.parentPosts[id];
      });

      return post;
    };
  });

  this.body = {
    posts: _posts
  };
};

// GET /api/posts/:id
router.get.getPost = function* () {
  var id = this.params.id;

  var post = yield _modelsPosts2['default'].findById(id);

  var duoshuoReply = JSON.parse((yield requestAsync('http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=' + id + '&page=0&limit=1000')));

  var commentsId = Object.keys(duoshuoReply.parentPosts);
  post.comments = commentsId.map(function (id) {
    return duoshuoReply.parentPosts[id];
  });

  this.body = {
    post: post
  };
};

// POST /api/posts/new
router.post.newPost = function* () {
  var data = this.request.body;

  var reply = yield _modelsPosts2['default'].insert(data);

  this.body = reply;
};

exports['default'] = router;
module.exports = exports['default'];