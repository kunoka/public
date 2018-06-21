var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')
module.exports = function(opts){
  var wechat = new Wechat(opts)

  return async (ctx, next)=> {
    var that = ctx
    var token = opts.token
    var signature = ctx.query.signature
    var nonce = ctx.query.nonce
    var timestamp = ctx.query.timestamp
    var echostr = ctx.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    console.log('sha', sha)
    console.log(ctx)
    if(ctx.method === 'GET') {
      if(sha === signature) {
        ctx.body = echostr + ''
      }else{
        ctx.body = 'wrong'
      }
    }else if(ctx.method === 'POST') {
      if(sha !== signature) {
        ctx.body = 'wrong'
        return false
      }else{
        var data = await getRawBody(ctx.req, {
          length: ctx.length,
          limit: '1mb',
          encoding: ctx.charset
        })
        var content = await util.parseXMLAsync(data)
        console.log(content)
        var message = util.formatMessage(content.xml)
        console.log('==============')
        console.log(message)

        if (message.MsgType === 'event') {
          if (message.Event === 'subscribe') {
            var now = new Date().getTime()
            that.status = 200
            that.type = 'application/xml'
            // var reply = '<xml>
            //             <ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>
            //             <FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>
            //             <CreateTime>' + now + '</CreateTime>
            //             <MsgType><![CDATA[text]]></MsgType>
            //             <Content><![CDATA[Hi, 欢迎来到葡萄的测试账号]]></Content>
            //             </xml>'
            var reply = '<xml>'+
                        '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
                        '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
                        '<CreateTime>' + now + '</CreateTime>' +
                        '<MsgType><![CDATA[text]]></MsgType>' +
                        '<Content><![CDATA[Hi, 欢迎来到葡萄的测试账号]]></Content>' +
                        '</xml>'
            console.log('---------------')
            console.log(reply)
            that.body = reply
            return
          }
        }
      }
    }
    await next();
  }
}