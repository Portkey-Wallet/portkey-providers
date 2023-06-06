import { DappInteractionStream } from '@portkey/providers';
import { IResponseType } from '@portkey/provider-types';
const noop = () => undefined;

export type PortkeyPostOptions = {
  name: string;
  targetWindow?: any;
  postWindow?: any;
};

export class ContentPostStream extends DappInteractionStream {
  private _name: string;
  private _origin: string;
  private _postWindow: any;
  _read = noop;
  constructor({ postWindow = window, targetWindow, name }: PortkeyPostOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : location.origin;
    this._postWindow = postWindow;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }
  _write = (chunk: any, _encoding?: string, cb?: (error?: Error | null | undefined) => void) => {
    try {
      this._postWindow.postMessage(JSON.stringify(JSON.parse(chunk)));
    } catch (err) {
      return cb?.(new Error('PortkeyPostStream - disconnected'));
    }
    return cb?.();
  };

  send = (params: IResponseType) => {
    this.write(JSON.stringify(params));
  };

  _onMessage(event: any): void {
    try {
      console.log(this._origin, 'ContentPostStream======this._origin');
      console.log(this._name, 'ContentPostStream======this._name');
      const msg = event.data;
      if (typeof msg !== 'string') return;
      const data = JSON.parse(msg);
      // validate message
      if (!data || typeof data !== 'object') return;
      if (data.target && data.target !== this._name) return;

      if (data.payload !== undefined && typeof data.payload !== 'object' && data.payload !== null) return;

      this.push(msg);
    } catch (error) {
      console.log(error, 'Portkey send message error');
    }
  }
}
