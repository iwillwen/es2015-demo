import Vue from 'vue'
import marked from 'marked'

import './duoshuo'

import Posts from '../models/posts'

const template = `
  <h1 v-text="title"></h1>
  <small>由 {{author}} 发表</small>
  <div class="post" v-html="content | marked"></div>
  <duoshuo v-if="loaded" post_id="{{id}}" post_title="{{title}}"></duoshuo>
`

let postVm = Vue.component('post', {
  template: template,
  replace: true,
  props: [ 'id' ],

  data() {
    return {
      id: this.id,
      content: '',
      title: '',
      loaded: false
    }
  },

  async created() {
    let post = await Posts.getPost(this.id)
    post.loaded = true
    this.$data = post
  },

  filters: {
    marked
  }
})

export default postVm