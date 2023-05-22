const { Web3Provider } = require('@portkey/providers');
const { Duplex } = require('readable-stream');
class PortkeyPortStream extends Duplex {
  _write = function (msg, _encoding, cb) {
    try {
      if (Buffer.isBuffer(msg)) {
        const data = msg.toJSON();
        data._isBuffer = true;
        window.ReactNativeWebView.postMessage(JSON.stringify({ ...data, origin: window.location.href }));
      } else {
        if (msg.data) {
          msg.data.toNative = true;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ ...msg, origin: window.location.href }));
      }
    } catch (err) {
      return cb(new Error('MobilePortStream - disconnected'));
    }
    return cb();
  };
}

const portkey = new Web3Provider({
  connectionStream: new PortkeyPortStream(),
});

exports.portkey = portkey;
