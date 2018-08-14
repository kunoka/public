'use strict'
var config = require('./config');
var Wechat = require('./wechat/wechat');
var wechatApi = new Wechat(config.wechat);
exports.reply = async function (next) {
  var message = this.weixin
  // console.log('||||| weixin.js - async function reply - message ||||||')
  // console.log(message)
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
      }

      this.body = '哈哈，你订阅了这个号\r\n' + ' 消息ID：' + message.MsgId
    }
    else if (message.Event === 'unsubscribe') {
      console.log(message.FromUserName + ' 悄悄地走了...')
      this.body = ''
    }
    else if (message.Event === 'LOCATION') {
      this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    }
    else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单：' + message.EventKey
    }
    else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + ' ' + mesage.Ticket)
      this.body = '看到你扫了一下哦'
    }
    else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单中的链接: ' + mesage.EventKey
    }
  }
  else if (message.MsgType === 'text') {
    // console.log('--------------- weixin.js message.MsgType ----------')
    // console.log(message.MsgType)
    var content = message.Content
    var reply = '额，你说的 ' + message.Content + ' 太复杂了'

    if (content === '1') {
      reply = '天下第一吃鸡'
    }
    else if (content === '2') { // location
      // reply = '天下第二吃蛋'
      // this.body = reply
      reply = {
        type: 'location'
      }
      this.body = reply
    }
    else if (content === '3') {
      reply = '天下第三搬砖'
    }
    else if (content === '4') {
      reply = [{
        title: '技术改变世界',
        description: '只是个描述而已',
        picUrl: 'http://mmsns.qpic.cn/mmsns/L4qjYtOibuml238YYBcfS2FQ8JtNN69Bc4bbbscvQRrljbedVjlMEAA/0',
        url: 'http://github.com/'
      }]
    }
    else if (content === '5' || content === '图片' || content === 'picture') {
      let data = await wechatApi.uploadMaterial('image', __dirname + '/view.jpg');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    else if (content === '6' || content === '视频' || content === 'video') {
      let data = await wechatApi.uploadMaterial('video', __dirname + '/dive.mp4');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'video',
        title: '这是测试视频',
        description: '创建时间 ' + new Date(),
        mediaId: data.media_id
      }
    }
    else if (content === '7' || content === '音乐' || content === 'voice' || content === 'music') {
      let data = await wechatApi.uploadMaterial('voice', __dirname + '/seve.mp3');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'voice',
        mediaId: data.media_id
      }
    }
    this.body = reply
  }
  else {

  }
  await next
}