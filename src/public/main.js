import Vue from 'vue'
import min from 'min'
import watch from 'watchman-router'
import qs from 'querystring'

import Index from './controllers/index'
import Post from './controllers/post'
import Publish from './controllers/publish'

let layoutVM = new Vue({
  el: '#wrapper',
  data: {
    html: ''
  }
})

let JSONPhelper = new Vue({
  el: '#jsonp-helper',
  data: {
    json: false,
    url: ''
  },

  methods: {
    load(url) {
      return new Promise((resolve, reject) => {
        this.$data.url = url
        window.jsonpcallback = data => {
          resolve(data)
        }
      })
    }
  }
})

watch({
  '/': Index,
  '#!/': Index,
  '#!/post/:id': Post,
  '#!/new': Publish
})
  .use((ctx, next) => {
    ctx.layoutVM = layoutVM
    ctx.jsonpHelper = JSONPhelper
    ctx.query = qs.parse(window.location.search.substr(1))
    next()
  })
  .run()