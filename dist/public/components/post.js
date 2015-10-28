'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

require('./duoshuo');

var _modelsPosts = require('../models/posts');

var _modelsPosts2 = _interopRequireDefault(_modelsPosts);

var template = '\n  <h1 v-text="title"></h1>\n  <small>由 {{author}} 发表</small>\n  <div class="post" v-html="content | marked"></div>\n  <duoshuo v-if="loaded" post_id="{{id}}" post_title="{{title}}"></duoshuo>\n';

var postVm = _vue2['default'].component('post', {
  template: template,
  replace: true,
  props: ['id'],

  data: function data() {
    return {
      id: this.id,
      content: '',
      title: '',
      loaded: false
    };
  },

  created: _asyncToGenerator(function* () {
    var post = yield _modelsPosts2['default'].getPost(this.id);
    post.loaded = true;
    this.$data = post;
  }),

  filters: {
    marked: _marked2['default']
  }
});

exports['default'] = postVm;
module.exports = exports['default'];