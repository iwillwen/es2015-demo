import thunkify from 'thunkify'
import request from 'request'

import posts from '../models/posts'

const requestAsync = thunkify((opts, callback) => {
  request(opts, (err, res, body) => callback(err, body))
})

let router = {
  get: {},
  post: {}
}

// GET /api/posts/list
router.get.listPosts = function*() {
  let page = parseInt(this.query.page || 0)
  const count = 10

  let _posts = yield posts.find({}, {
    skip: page * count,
    limit: count
  })

  _posts = yield _posts.map(post => {
    return function*() {
      let duoshuoReply = JSON.parse(yield requestAsync(`http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=${post._id}&page=0&limit=1000`))

      var commentsId = Object.keys(duoshuoReply.parentPosts)
      post.comments = commentsId.map(id => duoshuoReply.parentPosts[id])

      return post
    }
  })

  this.body = {
    posts: _posts
  }
}

// GET /api/posts/:id
router.get.getPost = function*() {
  let id = this.params.id

  let post = yield posts.findById(id)

  let duoshuoReply = JSON.parse(yield requestAsync(`http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=${id}&page=0&limit=1000`))

  var commentsId = Object.keys(duoshuoReply.parentPosts)
  post.comments = commentsId.map(id => duoshuoReply.parentPosts[id])

  this.body = {
    post: post
  }
}

// POST /api/posts/new
router.post.newPost = function*() {
  let data = this.request.body

  var reply = yield posts.insert(data)

  this.body = reply
}

export default router