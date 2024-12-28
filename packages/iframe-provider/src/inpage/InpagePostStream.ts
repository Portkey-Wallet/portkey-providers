/**
 * @remarks
 * PostStream By `document.dispatchEvent` / `document.addEventListener`
 */
import { DappInteractionStream } from '@portkey/providers';
import { PortkeyDocumentPostOptions } from '../types';

const noop = () => undefined;

export class InpagePostStream extends DappInteractionStream {
  private _name: string;
  private _origin: string;
  private _listenerEventName: string;
  private _dispatchEventName: string;
  private targetWindow: Window;

  _read = noop;
  constructor({
    targetWindow,
    name,
    listenerEventName = 'portkey-message-from-content-iframe',
    dispatchEventName = 'portkey-message-from-inpage-iframe',
  }: PortkeyDocumentPostOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : window.location.origin;
    this.targetWindow = targetWindow;
    this._listenerEventName = listenerEventName;
    this._dispatchEventName = dispatchEventName;
    console.log(this._listenerEventName, '_listenerEventName');
    window.addEventListener<any>('message', this._onMessage.bind(this), false);
  }
  _write = (chunk: any, _encoding?: string, cb?: (error?: Error | null | undefined) => void) => {
    try {
      this.targetWindow.postMessage({
        eventName: this._dispatchEventName,
        detail: JSON.stringify({ ...JSON.parse(chunk), origin: window.location.origin }),
      });
    } catch (err) {
      console.log(err, 'InpagePostStream send error');
      return cb?.(new Error('InpagePostStream - disconnected'));
    }
    return cb?.();
  };
  _onMessage(event: any) {
    try {
      const msg = event.data.detail;
      console.log(msg, event, 'Inpage====_onMessage');

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
      console.log(error, 'InpagePostStream: Portkey _onMessage error');
      return;
    }
  }
}
