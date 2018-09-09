var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var util = require('./util')
var fs = require('fs')
var _ = require('lodash')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?',
    fetch: prefix + 'media/get?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    fetch: prefix + 'material/get_material?',
    del: prefix + 'material/del_material?',
    update: prefix + 'material/update_news?',
    count: prefix + 'material/get_materialcount?access_token=',
    batch: prefix + 'material/batchget_material?access_token='
  },
  user: {
    remark: prefix + 'user/info/updateremark?access_token=',
    fetch: prefix + 'user/info?access_token=',
    batchFetch: prefix + 'user/info/batchget?access_token=',
    list: prefix + 'user/get?access_token='
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
  // console.log('---------wechat.js - Wechat.prototype.reply - xml')
  // console.log(xml)
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
    uploadUrl = api.permanent.uploadNewsPic;
  }
  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews;
    form = material;
  } else { // 临时和永久其他类型素材，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb）
    form.media = fs.createReadStream(material)
  }
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = uploadUrl + 'access_token=' + data.access_token;
      if (!permanent) {
        url += '&type=' + type;
      } else {
        form.access_token = data.access_token //这行传不传都行
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
      }).catch(function (err) {
        console.log(err)
        reject(err)
      })

    })
  })
}
Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
  let that = this;
  let fetchUrl = api.temporary.fetch;
  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = fetchUrl + 'access_token=' + data.access_token;
      let form = {}
      let options = {
        method: 'POST',
        url: url,
        json: true
      }
      if (permanent) {
        form.media_id = mediaId;
        form.access_token = data.access_token;
        options.body = form;
      } else {
        if (type === 'video') {
          url = url.replace('https://', 'http://');
        }
        url += '&media_id=' + mediaId;
      }
      if (type === 'news' || type === 'video') {
        request(options).then(function (response) {
          let data = response.body;
          if (data) {
            resolve(data);
          } else {
            throw new Error('Fetch material fails');
          }
        }).catch(function (err) {
          console.log(err);
          reject(err);
        });
      } else {
        resolve(url);
      }
    })
  })
}
Wechat.prototype.deleteMaterial = function (mediaId) {
  let that = this;
  let form = {
    media_id: mediaId
  };
  let delUrl = api.permanent.del;

  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = delUrl + 'access_token=' + data.access_token;

      let options = {
        method: 'POST',
        url: url,
        body: form,
        json: true
      }
      request(options).then(function (response) {
        let data = response.body;
        if (data) {
          resolve(data)
        } else {
          throw new Error('Delete material fail')
        }
      }).catch(function (err) {
        console.log(err)
        reject(err)
      })

    })
  })
}
Wechat.prototype.updateMaterial = function (mediaId, news) {
  let that = this;
  let form = {
    meida_id: mediaId
  };
  _.extend(form, news);
  let updateUrl = api.permanent.update;

  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = updateUrl + 'access_token=' + data.access_token;

      let options = {
        method: 'POST',
        url: url,
        body: form,
        json: true
      }
      // form.body = material;
      request(options).then(function (response) {
        let data = response.body;
        if (data) {
          resolve(data)
        } else {
          throw new Error('Update material fails')
        }
      }).catch(function (err) {
        console.log(err)
        reject(err)
      })

    })
  })
}
Wechat.prototype.countMaterial = function () {
  let that = this;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = api.permanent.count + data.access_token;
      let options = {
        method: 'GET',
        url: url,
        json: true
      }
      console.log(url)
      request(options).then(function (response) {
        let data = response.body;
        console.log('============');
        console.log(data);
        if (data) {
          resolve(data);
        } else {
          throw new Error('Count material fails');
        }
      }).catch(function (err) {
        console.log(err);
        reject(err);
      })
    })
  })
}
Wechat.prototype.batchMaterial = function (options) {
  let that = this;
  options.type = options.type || 'image';
  options.offset = options.offset || 0;
  options.count = options.count || 1;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = api.permanent.batch + data.access_token;
      let option = {
        method: 'POST',
        url: url,
        body: options,
        json: true
      }

      request(option).then(function (response) {
        let data = response.body;
        console.log('batchMaterial');
        console.log(data);
        if (data) {
          resolve(data)
        } else {
          throw new Error('Batch material fails');
        }
      }).catch(function (err) {
        console.log(err);
        reject(err);
      });
    });
  });
}
Wechat.prototype.remarkUser = function (openId, remark) {
  let that = this;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = api.user.remark + data.access_token;
      let form = {
        openid: openId,
        remark: remark
      }
      let options = {
        'method': 'POST',
        'url': url,
        'json': true
      };
      options.body = form;
      request(options).then(function (response) {
        let data = response.body;
        if (data) {
          resolve(data);
        } else {
          throw new Error('Remark user fails');
        }
      }).catch(function (err) {
        console.log(err);
        reject(err);
      });
    });
  });
}
Wechat.prototype.fetchUsers = function (openIds, lang) {
  let that = this;
  lang = lang || 'zh_CN';
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url;
      let options = {
        json: true
      };
      if (Array.isArray(openIds)) {
        url = api.user.batchFetch + data.access_token;
        options.body = {
          user_list: openIds
        }
        options.method = 'POST';
      } else {
        url = api.user.fetch + data.access_token + '&openid=' + openIds + '&lang=' + lang;
        options.method = 'GET';
      }

      options.url = url;
      request(options).then(function (response) {
        let data = response.body;
        if (data) {
          resolve(data);
        } else {
          throw new Error('Fetch Users material fails');
        }
      }).catch(function (err) {
        console.log(err);
        reject(err);
      });
    });
  });
}

Wechat.prototype.listUsers = function (openId) {
  let that = this;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      let url = api.user.list + data.access_token;
      if(openId) {
        url += '&next_openid=' + openId;
      }
      request({url: url, json: true})
        .then(function (response) {
          let data = response.body;
          if(data) {
            resolve(data);
          }else{
            throw new Error('List user fails');
          }
        })
        .catch(function (err) {
          console.log(err);
          reject(err);
        })
    });
  });

}

module.exports = Wechat