var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var util = require('./util')
var fs = require('fs')
var _ = require('lodash')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?'
  }

  // upload: prefix + 'media/upload?access_token=ACCESS_TOKEN&type=TYPE'
}

function Wechat(opts) {
  // console.log('||||| wechat.js-function Wechat ||||||')
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken()
    .then(function (data) {
      try {
        data = JSON.parse(data)
      }
      catch (e) {
        return that.updateAccessToken(data)
      }
      if (that.isValidAccessToken(data)) {
        return Promise.resolve(data)
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

/*
Wechat.prototype.fetchAccessToken = function (data) {
  var that = this
  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }
  this.getAccessToken()
    .then(function (data) {
      try {
        data = JSON.parse(data)
      }
      catch (e) {
        return that.updateAccessToken(data)
      }
      if (that.isValidAccessToken(data)) {
        return Promise.resolve(data)
      }
      else {
        return that.updateAccessToken()
      }
    })
    .then(function (data) {
      that.access_token = data.access_token
      that.expires_in = data.expires_in
      that.saveAccessToken(data)
      return Promise.resolve(data)
    })
}
*/
Wechat.prototype.fetchAccessToken = function () {
  let that = this;
  return new Promise(function (resolve, reject) {
    if (that.isValidAccessToken(this)) {
      resolve(this);
    }
    that.getAccessToken()
      .then(function (data) {
        try {
          data = JSON.parse(data)
        }
        catch (e) {
          return that.updateAccessToken(data)
        }
        if (that.isValidAccessToken(data)) {
          return Promise.resolve(data)
        }
        else {
          return that.updateAccessToken()
        }
      })
      .then(function (data) {
        that.access_token = data.access_token
        that.expires_in = data.expires_in
        that.saveAccessToken(data)
        resolve(data);
      })
  })
}
Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  var access_token = data.acces_token
  var expires_in = data.expires_in
  var now = (new Date().getTime())
  if (now < expires_in) {
    return true
  }
  else {
    return false
  }
}
Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret
  // console.log(url)
  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function (response) {
      // console.log(response.body)
      var data = response.body
      var now = new Date().getTime()
      var expires_in = now + (data.expires_in - 20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}

Wechat.prototype.reply = function () {
  var content = this.body
  var message = this.weixin
  // console.log('---------wechat.js - Wechat.prototype.reply - content')
  // console.log(content)
  // console.log('---------wechat.js - Wechat.prototype.reply - message')
  // console.log(message)
  var xml = util.tpl(content, message)
  console.log('---------wechat.js - Wechat.prototype.reply - xml')
  console.log(xml)
  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  let that = this;
  let form = {};
  let uploadUrl = api.temporary.upload;
  if (permanent) {
    uploadUrl = api.permanent.upload;
    _.extend(form, permanent);
  }
  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic
  }
  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews
    form = material
  } else { // 临时和永久其他类型素材，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb）
    form.media = fs.createReadStream(material)
  }
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = uploadUrl + 'access_token=' + data.access_token;
      if (!permanent) {
        url += '&type=' + type;
      } else {
        // form.access_token = data.access_token //这行传不传都行
      }

      let options = {
        method: 'POST',
        url: url,
        json: true
      }
      if (type === 'news') { //如果是图文数组，传给body
        options.body = form
      } else {
        options.formData = form
      }

      request(options).then(function (response) {
        let data = response.body;
        if (data) {
          resolve(data)
        } else {
          throw new Error('upload material fail')
        }
      }).catch(function () {
        console.log(err)
        reject(err)
      })

    })
  })
}
/*
Wechat.prototype.uploadMeterial = function (type, filepath) {
  console.log('========wechatjs - uploadMaterial ========= ' + type);
  var that = this
  let form = {
    media: fs.createReadStream(filepath)
  }
  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
        let url = api.upload + 'access_token=' + data.access_token + '&type=' + type;
        request({
          method: 'POST',
          url: url,
          formData: form,
          json: true
        }).then(function (response) {
          var _data = response.body
          if (_data) {
            resolve(_data)
          } else {
            throw new Error('Upload material fails')
          }
        }).catch(function (err) {
            reject(err)
          })
      })
  })
}
*/
module.exports = Wechat