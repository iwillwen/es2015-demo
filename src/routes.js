import { router as Router } from 'koa-middlewares'

import posts from './controllers/posts'

let router = new Router()
router.get('/api/posts/list', posts.get.listPosts)
router.get('/api/posts/:id', posts.get.getPost)


export default router