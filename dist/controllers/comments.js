'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _thunkify = require('thunkify');

var _thunkify2 = _interopRequireDefault(_thunkify);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _configJson = require('../../config.json');

var requestAsync = (0, _thunkify2['default'])(function (opts, callback) {
  (0, _request2['default'])(opts, function (err, res, body) {
    return callback(err, body);
  });
});

var router = {
  get: {},
  post: {}
};

// GET /api/comments/post/:id
router.get.fetchCommentsInPost = function* () {
  var postId = this.params.id;

  var duoshuoReply = JSON.parse((yield requestAsync('http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=' + postId + '&page=0&limit=1000')));

  var commentsId = Object.keys(duoshuoReply.parentPosts);
  var comments = commentsId.map(function (id) {
    return duoshuoReply.parentPosts[id];
  });

  this.body = {
    comments: comments
  };
};

// POST /api/comments/post
router.post.postComment = function* () {
  var postId = this.request.body.post_id;
  var message = this.request.body.message;

  var reply = yield requestAsync({
    method: 'POST',
    url: 'http://api.duoshuo.com/posts/create.json',
    json: true,

    body: {
      short_name: _configJson.duoshuo.short_name,
      secret: _configJson.duoshuo.secret,
      thread_key: postId,
      message: message
    }
  });

  this.body = {
    comment: reply.response
  };
};

exports['default'] = router;
module.exports = exports['default'];