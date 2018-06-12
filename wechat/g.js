var sha1 = require('sha1')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
// var request = require('request')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
  accessToken: prefix + 'token?grant_type=client_credential'
}
function Wechat(opts) {
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken
  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data)
      }
      catch (e) {
        return that.updateAccessToken(data)
      }
      if (that.isValidAccessToken(data)) {
        Promise.resolve(data)
      }
      else {
        return that.updateAccessToken()
      }
    })
    .then(function (data) {
      that.access_token = data.access_token
      that.expires_in = data.expires_in
      that.saveAccessToken(data)
    })
}

Wechat.prototype.isValidAccessToken = function (data) {
  if(!data || !data.acces_token || !data.expires_in) {
    return false
  }
  var access_token = data.acces_token
  var expires_in = data.expires_in
  var now = (new Date().getTime())
  if( now < expires_in) {
    return true
  }
  else{
    return false
  }
}

Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret
  console.log(url)
  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function (response) {
      debugger
      console.log(response.body)
      var data = response.body
      var now = new Date().getTime()
      var expires_in = now + (data.expires_in - 20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}
module.exports = function(opts){
  var wechat = new Wechat(opts)
  return async (ctx, next)=> {
    console.log('===opts===')
    console.log(opts)
    console.log('ctx.query')
    console.log(ctx.query)
    var token = opts.token
    var signature = ctx.query.signature
    console.log('signature')
    console.log(signature)
    var nonce = ctx.query.nonce
    var timestamp = ctx.query.timestamp
    var echostr = ctx.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)
    console.log('sha')
    console.log(sha)
    if(sha === signature) {
      ctx.body = echostr + ''
    }else{
      ctx.body = 'wrong'
    }
    await next();
  }
}