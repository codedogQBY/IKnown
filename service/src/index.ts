import helmet = require('koa-helmet') // 安全相关
import http = require('http')
import * as Koa from 'koa'
const { koaBody } = require('koa-body') // post body 解析
import mongoosePaginate = require('mongoose-paginate')
import config = require('./config')
import mongodb = require('./mongodb')
import bot from './wechaty'

import router from './route'

const app = new Koa()
mongodb.connect()

// @ts-ignore
mongoosePaginate.paginate.options = {
  limit: config.APP.LIMIT,
}

app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date().getDate() - start.getDate()
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 中间件
// app.use(interceptor);
//
// app.use(initAdmin);

app.use(helmet())
app.use(
  koaBody({
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb',
  })
)

// 404 500
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = { code: 0, message: '服务器内部错误' }
  }
  if (ctx.status === 404 || ctx.status === 405) {
    ctx.body = { code: 0, message: '无效的api请求' }
  }
})

app.use(router.routes()).use(router.allowedMethods())

// start server
http.createServer(app.callback()).listen(config.APP.PORT, () => {
  console.log(`node-Koa Run！port at ${config.APP.PORT}`)
  bot
    .start()
    .then(() => {
      console.log('Wechaty start')
    })
    .catch((e) => {
      console.log(e)
    })
})
