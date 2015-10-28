import Vue from 'vue'

const template = `
  <div class="panel panel-default">
    <div v-if="title" class="panel-heading">
      <h3 class="panel-title">
        {{title}}
      </h3>
    </div>
    <div class="panel-body">
      <div v-if="content" v-html="content"></div>
      <ul v-if="list">
        <li v-repeat="el: list"><a href="{{el.link}}" target="_blank">{{el.title}}</a></li>
      </ul>
    </div>
    <div v-if="footer" class="panel-footer">
      {{footer}}
    </div>
  </div>
`

Vue.component('Panel', {
  template: template,
  replace: true,
  props: [ 'title', 'content', 'footer', 'list' ],

  data() {
    return {
      title: this.title || false,
      content: this.content || false,
      list: this.list || false,
      footer: this.footer || false
    }
  }
})