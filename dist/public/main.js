'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _watchmanRouter = require('watchman-router');

var _watchmanRouter2 = _interopRequireDefault(_watchmanRouter);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _controllersIndex = require('./controllers/index');

var _controllersIndex2 = _interopRequireDefault(_controllersIndex);

var _controllersPost = require('./controllers/post');

var _controllersPost2 = _interopRequireDefault(_controllersPost);

var _controllersPublish = require('./controllers/publish');

var _controllersPublish2 = _interopRequireDefault(_controllersPublish);

var layoutVM = new _vue2['default']({
  el: '#wrapper',
  data: {
    html: ''
  }
});

var JSONPhelper = new _vue2['default']({
  el: '#jsonp-helper',
  data: {
    json: false,
    url: ''
  },

  methods: {
    load: function load(url) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.$data.url = url;
        window.jsonpcallback = function (data) {
          resolve(data);
        };
      });
    }
  }
});

(0, _watchmanRouter2['default'])({
  '/': _controllersIndex2['default'],
  '#!/': _controllersIndex2['default'],
  '#!/post/:id': _controllersPost2['default'],
  '#!/new': _controllersPublish2['default']
}).use(function (ctx, next) {
  ctx.layoutVM = layoutVM;
  ctx.jsonpHelper = JSONPhelper;
  ctx.query = _querystring2['default'].parse(window.location.search.substr(1));
  next();
}).run();