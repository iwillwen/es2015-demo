'use strict';

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _watchmanRouter = require('watchman-router');

var _watchmanRouter2 = _interopRequireDefault(_watchmanRouter);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _index = require('./controllers/index');

var _index2 = _interopRequireDefault(_index);

var _post = require('./controllers/post');

var _post2 = _interopRequireDefault(_post);

var _publish = require('./controllers/publish');

var _publish2 = _interopRequireDefault(_publish);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var layoutVM = new _vue2.default({
  el: '#wrapper',
  data: {
    html: ''
  }
});

var JSONPhelper = new _vue2.default({
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

(0, _watchmanRouter2.default)({
  '/': _index2.default,
  '#!/': _index2.default,
  '#!/post/:id': _post2.default,
  '#!/new': _publish2.default
}).use(function (ctx, next) {
  ctx.layoutVM = layoutVM;
  ctx.jsonpHelper = JSONPhelper;
  ctx.query = _querystring2.default.parse(window.location.search.substr(1));
  next();
}).run();