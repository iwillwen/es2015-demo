'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _posts = require('../models/posts');

var _posts2 = _interopRequireDefault(_posts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports.default = (function () {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.layoutVM.$data.html = '\n    <form id="new-post" v-on="submit: submit">\n      <div class="form-group">\n        <label for="author">你的名字</label>\n        <input type="text" class="form-control" name="author" id="author" v-model="author" />\n      </div>\n      <div class="form-group">\n        <label for="title">标题</label>\n        <input type="text" class="form-control" name="title" id="title" v-model="title" />\n      </div>\n      <div class="form-group">\n        <label for="content">内容</label>\n        <div class="row">\n          <div class="col-md-6">\n            <textarea class="form-control" name="content" id="content" rows="10" v-model="content"></textarea>\n          </div>\n          <div class="col-md-6" v-html="content | marked"></div>\n        </div>\n      </div>\n      <button type="submit" class="btn btn-primary">提交</button>\n    </form>\n  ';

    _vue2.default.nextTick(function () {
      new _vue2.default({
        el: '#new-post',

        data: {
          title: '',
          content: '',
          author: ''
        },

        methods: {
          submit: (function () {
            var ref = _asyncToGenerator(function* (e) {
              e.preventDefault();

              var post = yield _posts2.default.publishPost({
                title: this.$data.title,
                content: this.$data.content,
                author: this.$data.author
              });

              window.location.hash = '#!/post/' + post.id;
            });

            return function submit(_x2) {
              return ref.apply(this, arguments);
            };
          })()
        },

        filters: {
          marked: _marked2.default
        }
      });
    });
  });

  return function handle(_x) {
    return ref.apply(this, arguments);
  };
})();