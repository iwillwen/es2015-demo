import Vue from 'vue'

import { blogUrl } from '../config'

const duoshuoCode = `
  <div class="ds-thread" data-thread-key="{{id}}" data-title="{{title}}" data-url="{{baseUrl}}/#!/post/{{id}}"></div>
  <!-- 多说评论框 end -->
  <!-- 多说公共JS代码 start (一个网页只需插入一次) -->
  <script type="text/javascript">
  <!-- 多说公共JS代码 end -->
`

export default Vue.component('duoshuo', {
  template: duoshuoCode,
  replace: true,
  props: [ 'post_title', 'post_id' ],

  data() {
    return {
      baseUrl: blogUrl,
      id: this['post_id'],
      title: this['post_title']
    }
  },

  ready() { 
    DUOSHUO.EmbedThread(document.querySelector('.ds-thread'))
  }

})