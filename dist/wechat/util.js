'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var xml2js = require('xml2js');
var Promise = require('bluebird');

exports.parseXMLAsync = function (xml) {
  return new Promise(function (resolve, reject) {
    xml2js.parseString(xml, { trim: true }, function (err, content) {
      if (err) reject(err);else resolve(content);
    });
  });
};

function formatMessage(result) {
  debugger;
  var message = {};
  if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
    var keys = Object.keys(result);
    for (var i = 0; i < keys.length; i++) {
      var item = result[keys[i]];
      var key = keys[i];

      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }
      if (item.length === 1) {
        var val = item[0];
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || '').trim();
        }
      } else {
        message[key] = [];
        for (var j = 0, k = item.length; j < k; j++) {
          message[key].push(formatMessage(item[j]));
        }
      }
    }
  }
  return message;
}

exports.formatMessage = formatMessage;
//# sourceMappingURL=util.js.map