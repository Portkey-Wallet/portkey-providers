import { DappInteractionStream } from './DappStream';

const noop = () => undefined;

export type PortkeyPortOptions = {
  name: string;
  targetWindow?: any;
  portWindow?: any;
};

export class PortkeyPortStream extends DappInteractionStream {
  private _name: string;
  private _origin: string;
  private _portWindow: any;
  _read = noop;
  constructor({ portWindow = window, targetWindow, name }: PortkeyPortOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : location.origin;
    this._portWindow = portWindow;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }
  _write = (msg, _encoding, cb) => {
    try {
      this._portWindow.postMessage(JSON.stringify({ ...JSON.parse(msg), origin: window.location.href }));
    } catch (err) {
      return cb(new Error('MobilePortStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event) {
    console.log(event, '======event');
    console.log(this._portWindow, '======this._portWindow');
    console.log(this._origin, '======this._origin');
    console.log(this._name, '======this._name');

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
