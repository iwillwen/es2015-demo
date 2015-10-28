import 'whatwg-fetch'
import min from 'min'

async function listPosts(page = 0) {
  const count = 10

  let existsInMinDB = await min.exists('posts:id')

  if (!existsInMinDB) {
    var posts = (await _fetchPost(page))
      .map(post => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          author: post.author,
          comments: post.comments.length,
          get summary() {
            return post.content.substr(0, 20) + '...'
          }
        }
      })

    for (let i = 0; i < posts.length; i++) {
      let post = posts[i]

      await min.sadd('posts:id', post.id)
      await min.hmset(`post:${post.id}`, post)
    }
  } else {
    let ids = await min.smembers('posts:id')
    ids = ids.slice(page * count, (page + 1) * count)
    var posts = await min.mget(ids.map(id => `post:${id}`))
  }

  return posts
}

async function _fetchPost(page) {
  let res = await fetch(`/api/posts/list?page=${page}`)
  let reply = await res.json()

  return reply.posts
}

async function getPost(id) {
  return await min.hgetall(`post:${id}`)
}

async function publishPost(post) {
  let res = await fetch('/api/posts/new', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  })
  var _post = await res.json()

  await min.sadd('posts:id', _post._id)
  await min.hmset(`post:${_post._id}`, {
    id: _post._id,
    title: _post.title,
    content: _post.content,
    author: _post.author,
    comments: 0,
    get summary() {
      return _post.title.substr(0, 20) + '...'
    }
  })

  _post.id = _post._id

  return _post
}

export default {
  listPosts,
  getPost,
  publishPost
}