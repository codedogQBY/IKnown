import Router = require('koa-router')
import config = require('../config')

const router = new Router({
  prefix: config.APP.ROOT_PATH,
})

// Api
router.get('/', (ctx, next) => {
  ctx.response.body = `Hello, World!`
})

export default router
