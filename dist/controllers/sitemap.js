'use strict';

var _thunkify = require('thunkify');

var _thunkify2 = _interopRequireDefault(_thunkify);

var _sitemap = require('sitemap');

var _sitemap2 = _interopRequireDefault(_sitemap);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _posts = require('../models/posts');

var _posts2 = _interopRequireDefault(_posts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = {
  get: {}
};

var sm = null;
var timer = null;

function* updateSitemap() {
  var posts = yield _posts2.default.find();

  var urls = posts.map(function (post) {
    return { url: '#!/posts/' + post._id };
  });

  sm = _sitemap2.default.createSitemap({
    hostname: 'http://es2015-demo.daoapp.io',
    cacheTime: 600000, // 600 sec cache period
    urls: urls
  });

  timer = setTimeout(function () {
    (0, _co2.default)(updateSitemap);
  }, 10 * 60 * 1e3);

  return sm;
}

// GET /sitemap.xml
router.get.sitemap = function* () {
  if (!sm) var sm = yield updateSitemap();

  this.set('Content-Type', 'application/xml');
  this.body = sm.toString();
};