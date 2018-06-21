'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');
module.exports = function (opts) {
  var _this = this;

  var wechat = new Wechat(opts);

  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, next) {
      var that, token, signature, nonce, timestamp, echostr, str, sha, data, content, message, now, reply;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              that = ctx;
              token = opts.token;
              signature = ctx.query.signature;
              nonce = ctx.query.nonce;
              timestamp = ctx.query.timestamp;
              echostr = ctx.query.echostr;
              str = [token, timestamp, nonce].sort().join('');
              sha = sha1(str);


              console.log('sha', sha);
              console.log(ctx);

              if (!(ctx.method === 'GET')) {
                _context.next = 14;
                break;
              }

              if (sha === signature) {
                ctx.body = echostr + '';
              } else {
                ctx.body = 'wrong';
              }
              _context.next = 40;
              break;

            case 14:
              if (!(ctx.method === 'POST')) {
                _context.next = 40;
                break;
              }

              if (!(sha !== signature)) {
                _context.next = 20;
                break;
              }

              ctx.body = 'wrong';
              return _context.abrupt('return', false);

            case 20:
              _context.next = 22;
              return getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',
                encoding: ctx.charset
              });

            case 22:
              data = _context.sent;
              _context.next = 25;
              return util.parseXMLAsync(data);

            case 25:
              content = _context.sent;

              console.log(content);
              message = util.formatMessage(content.xml);

              console.log('==============');
              console.log(message);

              if (!(message.MsgType === 'event')) {
                _context.next = 40;
                break;
              }

              if (!(message.Event === 'subscribe')) {
                _context.next = 40;
                break;
              }

              now = new Date().getTime();

              that.status = 200;
              that.type = 'application/xml';
              // var reply = '<xml>
              //             <ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>
              //             <FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>
              //             <CreateTime>' + now + '</CreateTime>
              //             <MsgType><![CDATA[text]]></MsgType>
              //             <Content><![CDATA[Hi, 欢迎来到葡萄的测试账号]]></Content>
              //             </xml>'
              reply = '<xml>' + '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' + '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' + '<CreateTime>' + now + '</CreateTime>' + '<MsgType><![CDATA[text]]></MsgType>' + '<Content><![CDATA[Hi, 欢迎来到葡萄的测试账号]]></Content>' + '</xml>';

              console.log('---------------');
              console.log(reply);
              that.body = reply;
              return _context.abrupt('return');

            case 40:
              _context.next = 42;
              return next();

            case 42:
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