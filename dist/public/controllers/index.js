'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _posts = require('../models/posts');

var _posts2 = _interopRequireDefault(_posts);

require('../components/post-in-list');

require('../components/panel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports.default = (function () {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.layoutVM.$data.html = '\n    <h1>\n      ES2015 实战 - DEMO\n    </h1>\n    <hr>\n    <div id="posts" class="col-md-9">\n      <post-in-list v-repeat="posts"></post-in-list>\n    </div>\n    <div id="sidebar" class="col-md-3">\n      <panel title="公告" content="{{content}}" list="{{list}}"></panel>\n    </div>\n  ';

    var refresh = 'undefined' != typeof ctx.query.refresh;
    var page = ctx.query.page || 0;

    var posts = yield _posts2.default.listPosts(page);

    _vue2.default.nextTick(function () {
      new _vue2.default({
        el: '#posts',
        data: {
          posts: posts
        }
      });

      new _vue2.default({
        el: '#sidebar',
        data: {
          content: '文章地址 <a href="http://gank.io/post/" target="_blank">匠心写作</a>\n                  <br />\n                  感謝以下贊助商對本文的支持',
          list: [{ title: 'DaoCloud', link: 'http://daocloud.io' }, { title: '100Offer', link: 'http://100offer.com' }]
        }
      });
    });
  });

  return function handle(_x) {
    return ref.apply(this, arguments);
  };
})();