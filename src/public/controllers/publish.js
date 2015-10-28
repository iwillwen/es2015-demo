import Vue from 'vue'
import min from 'min'
import marked from 'marked'

import Posts from '../models/posts'

export default async function handle(ctx) {
  ctx.layoutVM.$data.html = `
    <form id="new-post" v-on="submit: submit">
      <div class="form-group">
        <label for="author">你的名字</label>
        <input type="text" class="form-control" name="author" id="author" v-model="author" />
      </div>
      <div class="form-group">
        <label for="title">标题</label>
        <input type="text" class="form-control" name="title" id="title" v-model="title" />
      </div>
      <div class="form-group">
        <label for="content">内容</label>
        <div class="row">
          <div class="col-md-6">
            <textarea class="form-control" name="content" id="content" rows="10" v-model="content"></textarea>
          </div>
          <div class="col-md-6" v-html="content | marked"></div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">提交</button>
    </form>
  `

  Vue.nextTick(() => {
    new Vue({
      el: '#new-post',

      data: {
        title: '',
        content: '',
        author: ''
      },

      methods: {
        async submit(e) {
          e.preventDefault()

          var post = await Posts.publishPost({
            title: this.$data.title,
            content: this.$data.content,
            author: this.$data.author
          })

          window.location.hash = `#!/post/${post.id}`
        }
      },

      filters: {
        marked
      }
    })
  })
}