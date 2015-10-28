import thunkify from 'thunkify'
import request from 'request'

import { duoshuo } from '../../config.json'

const requestAsync = thunkify((opts, callback) => {
  request(opts, (err, res, body) => callback(err, body))
})

let router = {
  get: {},
  post: {}
}

// GET /api/comments/post/:id
router.get.fetchCommentsInPost = function*() {
  let postId = this.params.id

  let duoshuoReply = JSON.parse(yield requestAsync(`http://api.duoshuo.com/threads/listPosts.json?short_name=es2015-in-action&thread_key=${postId}&page=0&limit=1000`))

  let commentsId = Object.keys(duoshuoReply.parentPosts)
  let comments = commentsId.map(id => duoshuoReply.parentPosts[id])

  this.body = {
    comments: comments
  }
}

// POST /api/comments/post
router.post.postComment = function*() {
  let postId = this.request.body.post_id
  let message = this.request.body.message

  let reply = yield requestAsync({
    method: 'POST',
    url: `http://api.duoshuo.com/posts/create.json`,
    json: true,

    body: {
      short_name: duoshuo.short_name,
      secret: duoshuo.secret,
      thread_key: postId,
      message: message
    }
  })

  this.body = {
    comment: reply.response
  }
}

export default router