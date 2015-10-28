import { router as Router } from 'koa-middlewares'

import posts from './controllers/posts'
import comments from './controllers/comments'

let router = new Router()

// Posts
router.get('/api/posts/list', posts.get.listPosts)
router.get('/api/posts/:id', posts.get.getPost)
router.post('/api/posts/new', posts.post.newPost)

// Comments
router.get('/api/comments/post/:id', comments.get.fetchCommentsInPost)
router.post('/api/comments/post', comments.post.postComment)

export default router