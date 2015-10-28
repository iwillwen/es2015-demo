'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var template = '\n  <div class="post" v-attr="id: id">\n    <h2><a href="/#!/post/{{id}}" v-text="title"></a></h2>\n    <p v-text="summary"></p>\n    <p>\n      <small>由 {{author}} 发表</small> | <small>{{comments}} 条评论</small> | <a class="btn" href="/#!/post/{{id}}">查看更多 »</a>\n    </p>\n  </div>\n';

var postComponent = _vue2['default'].component('post-in-list', {
  template: template,
  replace: true,

  filters: {
    marked: _marked2['default']
  }
});

exports['default'] = postComponent;
module.exports = exports['default'];