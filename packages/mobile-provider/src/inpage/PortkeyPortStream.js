const { Web3Provider } = require('@portkey/providers');
const { Duplex } = require('readable-stream');
const noop = () => undefined;
const CONTENT_SCRIPT = 'portkey-contentscript';

class PortkeyPortStream extends Duplex {
  _read = noop;
  constructor(options) {
    super();
    this._name = options.name;
    this._origin = options.targetWindow ? '*' : location.origin;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }
  _write = function (msg, _encoding, cb) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ ...JSON.parse(msg), origin: window.location.href }));
    } catch (err) {
      return cb(new Error('MobilePortStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event) {
    try {
      const msg = event.data;
      if (typeof msg !== 'string') return;
      const data = JSON.parse(msg);
      // validate message
      if (!data || typeof data !== 'object') return;

      if (this._origin !== '*' && data.origin && data.origin !== this._origin) return;

      // mark stream push message
      if (data.target && data.target !== this._name) return;

      if (!data.info || typeof data.info !== 'object') return;

      this.push(msg);
    } catch (error) {
      console.log(error, 'Portkey send message error');
    }
  }
}

const portkey = new Web3Provider({
  connectionStream: new PortkeyPortStream({ name: CONTENT_SCRIPT }),
});

exports.portkey = portkey;
