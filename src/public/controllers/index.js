import Vue from 'vue'
import min from 'min'
import AV from 'avoscloud-sdk'

import '../components/post-in-list'
import '../components/panel'

AV.initialize('1FyJrNv3YTh0gJgh1gmwfx1c', '9xkimPSEA880LJvNj3SmvrNx')

async function fetchPosts(page = 0, count = 10) {
  let query = new AV.Query("Posts")
  query.descending('created_at')
  query.skip(page * count)
  query.limit(count)
  return await query.find()
}

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
      <panel title="侧边栏" content="{{content}}" list="{{list}}"></panel>
    </div>
  `

  let refresh = 'undefined' != typeof ctx.query.refresh
  let page = ctx.query.page || 0

  let existsInMinDB = await min.exists('posts:id')

  if (!existsInMinDB || refresh) {
    var posts = (await fetchPosts(page))
      .map(post => {
        return {
          id: post.id,
          title: post.get('title'),
          content: post.get('content'),
          author: post.get('author'),
          comments: 0,
          get summary() {
            return post.get('content').substr(0, 20) + '...'
          }
        }
      })

    for (let i = 0; i < posts.length; i++) {
      let post = posts[i]

      await min.sadd('posts:id', post.id)
      await min.hmset(`post:${post.id}`, post)
      let postInfo = (await ctx.jsonpHelper.load(`http://api.duoshuo.com/threads/counts.jsonp?short_name=blog-es2015-in-action&threads=${post.id}&callback=jsonpcallback`)).response[0]
      let comments = postInfo ? postInfo.comments : 0
      await min.hset(`post:${post.id}`, 'comments', comments)
    }
  } else {
    let ids = await min.smembers('posts:id')
    var posts = await min.mget(ids.map(id => `post:${id}`))
  }

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
        content: `文章地址 <a href="">df</a>
                  <br />
                  感謝以下贊助商對本文的支持`,
        list: [1,2,3]
      }
    })
  })
}