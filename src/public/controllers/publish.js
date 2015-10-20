import Vue from 'vue'
import min from 'min'
import AV from 'avoscloud-sdk'
import marked from 'marked'

AV.initialize('1FyJrNv3YTh0gJgh1gmwfx1c', '9xkimPSEA880LJvNj3SmvrNx')

let Post = AV.Object.extend('Posts')

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
        submit(e) {
          e.preventDefault()

          let post = new Post()
          post.set('title', this.$data.title)
          post.set('content', this.$data.content)
          post.set('author', this.$data.author)
          post.save(null, {
            async success(_post) {
              await min.sadd('posts:id', _post.id)
              await min.hmset(`post:${_post.id}`, {
                id: _post.id,
                title: _post.get('title'),
                content: _post.get('content'),
                author: _post.get('author'),
                comments: 0,
                get summary() {
                  return _post.get('content').substr(0, 20) + '...'
                }
              })

              window.location.hash = `#!/post/${_post.id}`
            }
          })
        }
      },

      filters: {
        marked
      }
    })
  })
}