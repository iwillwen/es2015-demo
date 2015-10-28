import Vue from 'vue'

import '../components/post'

export default ctx => {
  ctx.layoutVM.$data.html = `
    <div id="post">
      <post id="${ctx.params.id}"></post>
    </div>
  `

  Vue.nextTick(() => {
    new Vue({
      el: '#post'
    })
  })
}