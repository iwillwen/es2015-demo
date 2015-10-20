import Vue from 'vue'

import '../components/post'

export default ctx => {
  ctx.layoutVM.$data.html = `
    <div id="post">
      <Post id="${ctx.params.id}"></Post>
    </div>
  `

  Vue.nextTick(() => {
    new Vue({
      el: '#post'
    })
  })
}