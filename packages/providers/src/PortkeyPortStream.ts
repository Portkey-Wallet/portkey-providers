import { DappInteractionStream } from './DappStream';

const noop = () => undefined;

export type PortkeyPortOptions = {
  name: string;
  targetWindow?: any;
  portWindow?: any;
};

export class PortkeyPortStream extends DappInteractionStream {
  private name: string;
  private origin: string;
  private portWindow: any;
  _read = noop;
  constructor({ portWindow = window, targetWindow, name }: PortkeyPortOptions) {
    super();
    this.name = name;
    this.origin = targetWindow ? '*' : location.origin;
    this.portWindow = portWindow;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }
  _write = (msg, _encoding, cb) => {
    try {
      this.portWindow.postMessage(JSON.stringify({ ...JSON.parse(msg), origin: window.location.href }));
    } catch (err) {
      return cb(new Error('MobilePortStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event) {
    console.log(event, '======event');
    console.log(this.portWindow, '======this.portWindow');
    console.log(this.origin, '======this.origin');
    console.log(this.name, '======this.name');

    try {
      const msg = event.data;
      if (typeof msg !== 'string') return;
      const data = JSON.parse(msg);
      // validate message
      if (!data || typeof data !== 'object') return;

      if (this.origin !== '*' && data.origin && data.origin !== this.origin) return;

      // mark stream push message
      if (data.target && data.target !== this.name) return;

      if (!data.info || typeof data.info !== 'object') return;

      this.push(msg);
    } catch (error) {
      console.log(error, 'Portkey send message error');
    }
  }
}
