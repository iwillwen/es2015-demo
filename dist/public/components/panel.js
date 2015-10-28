'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var template = '\n  <div class="panel panel-default">\n    <div v-if="title" class="panel-heading">\n      <h3 class="panel-title">\n        {{title}}\n      </h3>\n    </div>\n    <div class="panel-body">\n      <div v-if="content" v-html="content"></div>\n      <ul v-if="list">\n        <li v-repeat="el: list"><a href="{{el.link}}" target="_blank">{{el.title}}</a></li>\n      </ul>\n    </div>\n    <div v-if="footer" class="panel-footer">\n      {{footer}}\n    </div>\n  </div>\n';

_vue2['default'].component('Panel', {
  template: template,
  replace: true,
  props: ['title', 'content', 'footer', 'list'],

  data: function data() {
    return {
      title: this.title || false,
      content: this.content || false,
      list: this.list || false,
      footer: this.footer || false
    };
  }
});