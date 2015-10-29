import koa from 'koa'
import path from 'path'
import { bodyParser } from 'koa-middlewares'
import Static from 'koa-static'

import router from './routes'

let app = koa()
// Static
app.use(Static(path.resolve(__dirname, './public')))
// Parse the body in POST requests
app.use(bodyParser())
// Router
app.use(router.routes())

let PORT = parseInt(process.env.PORT || 3000)
app.listen(PORT, () => {
  console.log(`Demo is running, port:${PORT}`)
})