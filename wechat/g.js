var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(opts, handler){
  // console.log('||||| g.js-function|||||||')
  var wechat = new Wechat(opts)
  // console.log(wechat)
  return async (ctx, next)=> {
    // console.log('||||| g.js-async (ctx, next)|||||||')
    var token = opts.token
    var signature = ctx.query.signature
    var nonce = ctx.query.nonce
    var timestamp = ctx.query.timestamp
    var echostr = ctx.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)
    // console.log('||||| g.js-async (ctx, next) - ctx.method - sha |||||||')
    // console.log(sha)

    if(ctx.method === 'GET') {
      if(sha === signature) {
        ctx.body = echostr + ''
      }else{
        ctx.body = 'get connect done - singature failure'
      }
    }else if(ctx.method === 'POST') {
      if(sha !== signature) {
        ctx.body = 'post connect done - singature failure'
        return false
      }else{
        var data = await getRawBody(ctx.req, {
          length: ctx.length,
          limit: '1mb',
          encoding: ctx.charset
        })
        var content = await util.parseXMLAsync(data)
        // console.log('-----------g.js - content ----------')
        // console.log(content)
        var message = util.formatMessage(content.xml)
        // console.log('-----------g.js - message ----------')
        // console.log(message)

        ctx.weixin = message //挂载消息
        // console.log('-----------g.js - ctx ----------')
        // console.log(ctx)
        await handler.call(ctx, next) //转到业务层逻辑
        wechat.reply.call(ctx)  //真正回复
      }
    }
    await next();
  }
}