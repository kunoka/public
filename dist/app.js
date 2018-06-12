'use strict';
'user strict';

var Koa = require('koa');
var path = require('path');
// console.log(path)
var wechat = require('./wechat/g');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat = require('./wechat/g');
var config = {
  wechat: {
    appID: 'wx0dfafb2a0b6b9eca',
    appSecret: 'ea00a15c77c7fed7f9aff2800db5d420',
    token: 'grapeworldclass',
    getAccessToken: function getAccessToken() {
      return util.readFileAsync(wechat_file);
    },
    saveAccessToken: function saveAccessToken(data) {
      data = JSON.stringify(data);
      return util.writeFileAsync(wechat_file, data);
    }
  }
};

var app = new Koa();
app.use(wechat(config.wechat));

app.listen(1234);
console.log('Listening: 1234');
//# sourceMappingURL=app.js.map