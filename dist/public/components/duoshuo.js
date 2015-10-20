'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _config = require('../config');

var duoshuoCode = '\n  <div class="ds-thread" data-thread-key="{{id}}" data-title="{{title}}" data-url="{{baseUrl}}/#!/post/{{id}}"></div>\n  <!-- 多说评论框 end -->\n  <!-- 多说公共JS代码 start (一个网页只需插入一次) -->\n  <script type="text/javascript">\n  <!-- 多说公共JS代码 end -->\n';

exports['default'] = _vue2['default'].component('duoshuo', {
  template: duoshuoCode,
  replace: true,
  props: ['post_title', 'post_id'],

  data: function data() {
    return {
      baseUrl: _config.blogUrl,
      id: this['post_id'],
      title: this['post_title']
    };
  },

  ready: function ready() {
    DUOSHUO.EmbedThread(document.querySelector('.ds-thread'));
  }

});
module.exports = exports['default'];