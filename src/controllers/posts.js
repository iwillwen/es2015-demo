import AV from '../lib/leancloud'

let Post = AV.Object.extend('Posts')
let Posts = AV.Collection.extend({
  model: Post
})

let router = {
  get: {}
}

// GET /api/posts/list
router.get.listPosts = function*() {
  let page = parseInt(this.query.page || 0)
  const count = 10

  let query = new AV.Query(Post)
  query.descending('created_at')
  query.skip(page * count)
  query.limit(count)
  let posts = yield query.find()

  this.body = {
    posts: posts
  }
}

// GET /api/posts/:id
router.get.getPost = function*() {
  let id = this.params.id

  let query = new AV.Query(Post)
  let post = yield query.get(id)

  this.body = {
    post: post
  }
}

export default router