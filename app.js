'user strict'

var Koa = require('koa')
var sha1 = require('sha1')
var config = {
  wechat: {
    appID: 'wxc31dac4a5b5c7f81',
    appSecret: 'f223176eb31de0e4850025e473dcdf37',
    token: 'grapeworldclass'
  }
}

var app = new Koa()
app.use(async (ctx, next)=> {
  console.log(ctx.query)
  var token = config.wechat.token
  var signature = ctx.query.signature
  var nonce = ctx.query.nonce
  var timestamp = ctx.query.timestamp
  var echostr = ctx.query.echostr
  var str = [token, timestamp, nonce].sort().join('')
  var sha = sha1(str)
  if(sha === signature) {
    ctx.body = echostr + ''
  }else{
    ctx.body = 'wrong'
  }
  await next();
})

app.listen(1234)
console.log('Listening: 1234')