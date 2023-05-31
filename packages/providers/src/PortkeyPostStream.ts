import { DappInteractionStream } from './DappStream';

const noop = () => undefined;

export type PortkeyPostOptions = {
  name: string;
  targetWindow?: any;
  postWindow?: any;
};

export class PortkeyPostStream extends DappInteractionStream {
  private _name: string;
  private _origin: string;
  private _postWindow: any;
  _read = noop;
  constructor({ postWindow = window, targetWindow, name }: PortkeyPostOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : window.location.origin;
    this._postWindow = postWindow;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }
  _write = (msg, _encoding, cb) => {
    try {
      this._postWindow.postMessage(JSON.stringify({ ...JSON.parse(msg), origin: window.location.origin }));
    } catch (err) {
      return cb(new Error('PortkeyPostStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event) {
    console.log(event, '======event');
    console.log(this._postWindow, '======this._postWindow');
    console.log(this._origin, '======this._origin');
    console.log(this._name, '======this._name');
    console.log(event.data, '======this._name');

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
