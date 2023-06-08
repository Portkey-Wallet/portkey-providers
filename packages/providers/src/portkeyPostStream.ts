import { DappInteractionStream } from './dappStream';

const noop = () => undefined;

export type PortkeyPostOptions = {
  name: string;
  targetWindow?: any;
  postWindow: PostWindow;
  originWindow: OriginWindow;
};

export interface PostWindow {
  postMessage(message: any): void;
}

interface OriginWindow {
  addEventListener(
    type: string,
    listener: (event: MessageEvent<any>) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
}
export class PortkeyPostStream extends DappInteractionStream {
  protected _name: string;
  protected _origin: string;
  protected _postWindow: PostWindow;
  protected _originWindow: OriginWindow;
  _read = noop;
  constructor({ postWindow, targetWindow, name, originWindow }: PortkeyPostOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : window.location.origin;
    this._postWindow = postWindow;
    this._originWindow = originWindow;
    this._originWindow.addEventListener('message', this._onMessage.bind(this), false);
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
      return;
    }
  }
}
