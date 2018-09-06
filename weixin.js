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

    // 1. 回复文本 - ok
    if (content === '1') {
      reply = '天下第一吃鸡'
    }
    // 2. 定位 - 失败
    else if (content === '2') { // location
      // reply = '天下第二吃蛋'
      // this.body = reply
      reply = {
        type: 'location'
      }
      this.body = reply
    }
    // 3. 回复文本 - ok
    else if (content === '3') {
      reply = '天下第三搬砖'
    }
    // 4. 回复图文 - ok
    else if (content === '4') {
      reply = [{
        title: '技术改变世界',
        description: '只是个描述而已',
        picUrl: 'http://mmsns.qpic.cn/mmsns/L4qjYtOibuml238YYBcfS2FQ8JtNN69Bc4bbbscvQRrljbedVjlMEAA/0',
        url: 'http://github.com/'
      }]
    }
    // 5. 上传永久素材 - 图片
    else if (content === '5' || content === '图片' || content === 'picture') {
      let data = await
        wechatApi.uploadMaterial('image', __dirname + '/view.jpg');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'image',
        mediaId: data.media_id,
      }
    }
    // 6. 上传永久素材 - 视频
    else if (content === '6' || content === '视频' || content === 'video') {
      let data = await
        wechatApi.uploadMaterial('video', __dirname + '/dive.mp4');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'video',
        title: '这是测试视频',
        description: '创建时间 ' + new Date(),
        mediaId: data.media_id
      }
    }
    // 7. 上传永久素材 - 音频
    else if (content === '7' || content === '音乐' || content === 'voice' || content === 'music') {
      let data = await
        wechatApi.uploadMaterial('voice', __dirname + '/seve.mp3');
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'voice',
        mediaId: data.media_id
      }
    }
    // 8. 上传永久素材 - 图片
    else if (content === '8') {
      let data = await
        wechatApi.uploadMaterial('image', __dirname + '/view.jpg', {type: 'image'});
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'image',
        mediaId: data.media_id,
      }
    }
    // 9. 上传永久素材 - 视频
    else if (content === '9') {
      let data = await
        wechatApi.uploadMaterial('video', __dirname + '/dive.mp4', {
          type: 'video',
          description: '{"title":"Hello Vedio", "introduction":"Never think about give up"}'
        });
      console.log('||||data|||||');
      console.log(data)
      reply = {
        type: 'video',
        title: '这是测试视频',
        description: '创建时间 ' + new Date(),
        mediaId: data.media_id
      }
    }
    // 10. 上传永久素材 - 图片 + 上传图文 + 获取素材列表
    else if (content === '10') {
      var picData = await wechatApi.uploadMaterial('image', __dirname + '/view.jpg', {type: 'image'});
      console.log('picData');
      console.log(picData);
      var media = {
        "articles": [
          {
            "title": '永久图文素材1',
            "thumb_media_id": picData.meida_id,
            "author": 'Harry',
            "digest": '永久图文1',
            "show_cover_pic": 1,
            "content": '这就是永久图文素材1',
            "content_source_url": 'https://github.com'
          },
          {
            "title": '永久图文素材2',
            "thumb_media_id": picData.meida_id,
            "author": 'Potter',
            "digest": '永久图文2',
            "show_cover_pic": 1,
            "content": '这就是永久图文素材2',
            "content_source_url": 'https://github.com'
          }]
      }
      console.log('media');
      console.log(media);
      let data = await wechatApi.uploadMaterial('news', media, {type: 'news'});
      console.log('---weixin.js = data ==');
      console.log(data);
      let result = await wechatApi.fetchMaterial(data.meida_id, 'news', {});
      console.log(result);
      let items = result.news_item;
      let news = [];
      items.forEach(function (item) {
        news.push({
          title: item.title,
          description: item.digest,
          picUrl: picData.url,
          url: item.url
        })
      });
      reply = news;
    }
    // 11. 获取素材总数
    else if (content === '11') {
      let counts = await wechatApi.countMaterial();
      console.log('||||counts|||||');
      console.log(counts);

      let results = await [
        wechatApi.batchMaterial({
          type: 'image',
          offset: 0,
          count: 10
        }),
        wechatApi.batchMaterial({
          type: 'video',
          offset: 0,
          count: 10
        }),
        wechatApi.batchMaterial({
          type: 'voice',
          offset: 0,
          count: 10
        }),
        wechatApi.batchMaterial({
          type: 'news',
          offset: 0,
          count: 10
        }),
      ];
      console.log('--result--');
      console.log(JSON.stringify(results));
      reply = '1';

      // let splitStr = ' / ';
      // reply = '音频数量 ' + data.voice_count + splitStr + '视频数量 ' + data.video_count + splitStr +
      //   '图片数量 ' + data.image_count + splitStr + '消息数量' + splitStr + data.news_count;
      console.log(reply)
    }
    this.body = reply
  }
  else {

  }
  await
    next
}