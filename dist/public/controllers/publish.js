'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _avoscloudSdk = require('avoscloud-sdk');

var _avoscloudSdk2 = _interopRequireDefault(_avoscloudSdk);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

_avoscloudSdk2['default'].initialize('1FyJrNv3YTh0gJgh1gmwfx1c', '9xkimPSEA880LJvNj3SmvrNx');

var Post = _avoscloudSdk2['default'].Object.extend('Posts');

exports['default'] = _asyncToGenerator(function* (ctx) {
  ctx.layoutVM.$data.html = '\n    <form id="new-post" v-on="submit: submit">\n      <div class="form-group">\n        <label for="author">你的名字</label>\n        <input type="text" class="form-control" name="author" id="author" v-model="author" />\n      </div>\n      <div class="form-group">\n        <label for="title">标题</label>\n        <input type="text" class="form-control" name="title" id="title" v-model="title" />\n      </div>\n      <div class="form-group">\n        <label for="content">内容</label>\n        <div class="row">\n          <div class="col-md-6">\n            <textarea class="form-control" name="content" id="content" rows="10" v-model="content"></textarea>\n          </div>\n          <div class="col-md-6" v-html="content | marked"></div>\n        </div>\n      </div>\n      <button type="submit" class="btn btn-primary">提交</button>\n    </form>\n  ';

  _vue2['default'].nextTick(function () {
    new _vue2['default']({
      el: '#new-post',

      data: {
        title: '',
        content: '',
        author: ''
      },

      methods: {
        submit: function submit(e) {
          e.preventDefault();

          var post = new Post();
          post.set('title', this.$data.title);
          post.set('content', this.$data.content);
          post.set('author', this.$data.author);
          post.save(null, {
            success: _asyncToGenerator(function* (_post) {
              yield _min2['default'].sadd('posts:id', _post.id);
              yield _min2['default'].hmset('post:' + _post.id, Object.defineProperties({
                id: _post.id,
                title: _post.get('title'),
                content: _post.get('content'),
                author: _post.get('author'),
                comments: 0
              }, {
                summary: {
                  get: function get() {
                    return _post.get('content').substr(0, 20) + '...';
                  },
                  configurable: true,
                  enumerable: true
                }
              }));

              window.location.hash = '#!/post/' + _post.id;
            })
          });
        }
      },

      filters: {
        marked: _marked2['default']
      }
    });
  });
});
module.exports = exports['default'];