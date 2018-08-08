'user strict'

var Koa = require('koa')
var g = require('./wechat/g')
var config = require('./config')
var weixin = require('./weixin')

var app = new Koa()
app.use(g(config.wechat, weixin.reply))

// response
// app.use(async (ctx,next) => {
//   debugger
//   console.log(ctx)
//   await next()
//   console.log('-----------------response-----------')
//   ctx.body = 'Hello Koa ' + new Date() + ctx
// })

app.listen(1234)
console.log('Listening: 1234')