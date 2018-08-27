'use strict'
var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')

// 葡萄庄园
var config = {
  wechat: {
    appID: 'wxc31dac4a5b5c7f81',
    appSecret: '1323e0769141745cc6c3b24528cfe744',
    token: 'grapeworldclass',
    getAccessToken: function () {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function (data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}

// 测试账号
var config1 = {
  wechat: {
    appID: 'wx0dfafb2a0b6b9eca',
    appSecret: 'ea00a15c77c7fed7f9aff2800db5d420',
    token: 'grapeworldclass',
    getAccessToken: function () {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function (data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}
module.exports = config1