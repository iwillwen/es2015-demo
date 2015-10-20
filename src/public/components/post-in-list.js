import Vue from 'vue'
import marked from 'marked'

const template = `
<div class="post" v-attr="id: id">
  <h2><a href="/#!/post/{{id}}" v-text="title"></a></h2>
  <p v-text="summary"></p>
  <p>
    <small>由 {{author}} 发表</small> | <small>{{comments}} 条评论</small> | <a class="btn" href="/#!/post/{{id}}">查看更多 »</a>
  </p>
</div>
`

let postComponent = Vue.component('post-in-list', {
  template: template,
  replace: true,

  filters: {
    marked: marked
  }
})

export default postComponent