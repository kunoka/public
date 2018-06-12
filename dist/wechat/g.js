'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
// var request = require('request')
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential'
};
function Wechat(opts) {
  var that = this;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;
  this.getAccessToken().then(function (data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return that.updateAccessToken(data);
    }
    if (that.isValidAccessToken(data)) {
      Promise.resolve(data);
    } else {
      return that.updateAccessToken();
    }
  }).then(function (data) {
    that.access_token = data.access_token;
    that.expires_in = data.expires_in;
    that.saveAccessToken(data);
  });
}

Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.acces_token || !data.expires_in) {
    return false;
  }
  var access_token = data.acces_token;
  var expires_in = data.expires_in;
  var now = new Date().getTime();
  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
};

Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
  console.log(url);
  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function (response) {
      debugger;
      console.log(response.body);
      var data = response.body;
      var now = new Date().getTime();
      var expires_in = now + (data.expires_in - 20) * 1000;
      data.expires_in = expires_in;
      resolve(data);
    });
  });
};
module.exports = function (opts) {
  var _this = this;

  var wechat = new Wechat(opts);
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, next) {
      var token, signature, nonce, timestamp, echostr, str, sha;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log('===opts===');
              console.log(opts);
              console.log('ctx.query');
              console.log(ctx.query);
              token = opts.token;
              signature = ctx.query.signature;

              console.log('signature');
              console.log(signature);
              nonce = ctx.query.nonce;
              timestamp = ctx.query.timestamp;
              echostr = ctx.query.echostr;
              str = [token, timestamp, nonce].sort().join('');
              sha = sha1(str);

              console.log('sha');
              console.log(sha);
              if (sha === signature) {
                ctx.body = echostr + '';
              } else {
                ctx.body = 'wrong';
              }
              _context.next = 18;
              return next();

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};
//# sourceMappingURL=g.js.map