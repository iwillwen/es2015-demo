'use strict';

var listPosts = (function () {
  var ref = _asyncToGenerator(function* () {
    var page = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    var count = 10;

    var existsInMinDB = yield _min2.default.exists('posts:id');

    if (!existsInMinDB) {
      var posts = (yield _fetchPost(page)).map(function (post) {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          author: post.author,
          comments: post.comments.length,
          get summary() {
            return post.content.substr(0, 20) + '...';
          }
        };
      });

      for (var i = 0; i < posts.length; i++) {
        var post = posts[i];

        yield _min2.default.sadd('posts:id', post.id);
        yield _min2.default.hmset('post:' + post.id, post);
      }
    } else {
      var ids = yield _min2.default.smembers('posts:id');
      ids = ids.slice(page * count, (page + 1) * count);
      var posts = yield _min2.default.mget(ids.map(function (id) {
        return 'post:' + id;
      }));
    }

    return posts;
  });

  return function listPosts(_x) {
    return ref.apply(this, arguments);
  };
})();

var _fetchPost = (function () {
  var ref = _asyncToGenerator(function* (page) {
    var res = yield fetch('/api/posts/list?page=' + page);
    var reply = yield res.json();

    return reply.posts;
  });

  return function _fetchPost(_x3) {
    return ref.apply(this, arguments);
  };
})();

var getPost = (function () {
  var ref = _asyncToGenerator(function* (id) {
    var existsInMinDB = yield _min2.default.exists('post:' + id);

    if (existsInMinDB) {
      return yield _min2.default.hgetall('post:' + id);
    } else {
      var _ret = yield* (function* () {
        var res = yield fetch('/api/posts/' + id);
        var post = (yield res.json()).post;

        yield _min2.default.hmset('post:' + id, {
          id: post._id,
          title: post.title,
          content: post.content,
          author: post.author,
          comments: post.comments.length,
          get summary() {
            return post.content.substr(0, 20) + '...';
          }
        });

        return {
          v: post
        };
      })();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  });

  return function getPost(_x4) {
    return ref.apply(this, arguments);
  };
})();

var publishPost = (function () {
  var ref = _asyncToGenerator(function* (post) {
    var res = yield fetch('/api/posts/new', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });
    var _post = (yield res.json()).post;

    yield _min2.default.sadd('posts:id', _post._id);
    yield _min2.default.hmset('post:' + _post._id, {
      id: _post._id,
      title: _post.title,
      content: _post.content,
      author: _post.author,
      comments: 0,
      get summary() {
        return _post.title.substr(0, 20) + '...';
      }
    });

    _post.id = _post._id;

    return _post;
  });

  return function publishPost(_x5) {
    return ref.apply(this, arguments);
  };
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('whatwg-fetch');

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports.default = {
  listPosts: listPosts,
  getPost: getPost,
  publishPost: publishPost
};