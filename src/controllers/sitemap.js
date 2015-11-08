import thunkify from 'thunkify'
import sitemap from 'sitemap'
import co from 'co'

import Posts from '../models/posts'

let router = {
  get: {}
}

let sm = null
let timer = null

function* updateSitemap() {
  let posts = yield Posts.find()

  let urls = posts.map(post => {
    return { url: `#!/posts/${post._id}` }
  })

  sm = sitemap.createSitemap({
    hostname: 'http://es2015-demo.daoapp.io',
    cacheTime: 600000,  // 600 sec cache period
    urls: urls
  })

  timer = setTimeout(function() {
    co(updateSitemap)
  }, 10 * 60 * 1e3)

  return sm
}

// GET /sitemap.xml
router.get.sitemap = function*() {
  if (!sm)
    var sm = yield updateSitemap()

  this.set('Content-Type', 'application/xml')
  this.body = sm.toString()
}