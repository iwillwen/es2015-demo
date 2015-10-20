'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var fetchPosts = _asyncToGenerator(function* () {
  var page = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var count = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

  var query = new _avoscloudSdk2['default'].Query("Posts");
  query.descending('created_at');
  query.skip(page * count);
  query.limit(count);
  return yield query.find();
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _avoscloudSdk = require('avoscloud-sdk');

var _avoscloudSdk2 = _interopRequireDefault(_avoscloudSdk);

require('../components/post-in-list');

require('../components/panel');

_avoscloudSdk2['default'].initialize('1FyJrNv3YTh0gJgh1gmwfx1c', '9xkimPSEA880LJvNj3SmvrNx');

exports['default'] = _asyncToGenerator(function* (ctx) {
  ctx.layoutVM.$data.html = '\n    <h1>\n      ES2015 实战 - DEMO\n    </h1>\n    <hr>\n    <div id="posts" class="col-md-9">\n      <post-in-list v-repeat="posts"></post-in-list>\n    </div>\n    <div id="sidebar" class="col-md-3">\n      <panel title="侧边栏" content="{{content}}" list="{{list}}"></panel>\n    </div>\n  ';

  var refresh = 'undefined' != typeof ctx.query.refresh;
  var page = ctx.query.page || 0;

  var existsInMinDB = yield _min2['default'].exists('posts:id');

  if (!existsInMinDB || refresh) {
    var posts = (yield fetchPosts(page)).map(function (post) {
      return Object.defineProperties({
        id: post.id,
        title: post.get('title'),
        content: post.get('content'),
        author: post.get('author'),
        comments: 0
      }, {
        summary: {
          get: function get() {
            return post.get('content').substr(0, 20) + '...';
          },
          configurable: true,
          enumerable: true
        }
      });
    });

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];

      yield _min2['default'].sadd('posts:id', post.id);
      yield _min2['default'].hmset('post:' + post.id, post);
      var postInfo = (yield ctx.jsonpHelper.load('http://api.duoshuo.com/threads/counts.jsonp?short_name=es2015-in-action&threads=' + post.id + '&callback=jsonpcallback')).response[post.id];
      var comments = postInfo ? postInfo.comments : 0;
      yield _min2['default'].hset('post:' + post.id, 'comments', comments);
    }
  } else {
    var ids = yield _min2['default'].smembers('posts:id');
    var posts = yield _min2['default'].mget(ids.map(function (id) {
      return 'post:' + id;
    }));
  }

  _vue2['default'].nextTick(function () {
    new _vue2['default']({
      el: '#posts',
      data: {
        posts: posts
      }
    });

    new _vue2['default']({
      el: '#sidebar',
      data: {
        content: '文章地址 <a href="">df</a>\n                  <br />\n                  感謝以下贊助商對本文的支持',
        list: [1, 2, 3]
      }
    });
  });
});
module.exports = exports['default'];