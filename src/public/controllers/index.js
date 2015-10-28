import Vue from 'vue'

import Posts from '../models/posts'

import '../components/post-in-list'
import '../components/panel'

export default async function handle(ctx) {
  ctx.layoutVM.$data.html = `
    <h1>
      ES2015 实战 - DEMO
    </h1>
    <hr>
    <div id="posts" class="col-md-9">
      <post-in-list v-repeat="posts"></post-in-list>
    </div>
    <div id="sidebar" class="col-md-3">
      <panel title="公告" content="{{content}}" list="{{list}}"></panel>
    </div>
  `

  let refresh = 'undefined' != typeof ctx.query.refresh
  let page = ctx.query.page || 0

  let posts = await Posts.listPosts(page)

  Vue.nextTick(() => {
    new Vue({
      el: '#posts',
      data: {
        posts: posts
      }
    })

    new Vue({
      el: '#sidebar',
      data: {
        content: `文章地址 <a href="http://gank.io/post/" target="_blank">匠心写作</a>
                  <br />
                  感謝以下贊助商對本文的支持`,
        list: [
          { title: 'DaoCloud', link: 'http://daocloud.io' }
        ]
      }
    })
  })
}