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

  _read = noop;
  constructor({
    targetWindow,
    name,
    listenerEventName = 'portkey-message-from-content',
    dispatchEventName = 'portkey-message-from-inpage',
  }: PortkeyDocumentPostOptions) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : window.location.origin;
    this._listenerEventName = listenerEventName;
    this._dispatchEventName = dispatchEventName;
    document.addEventListener(this._listenerEventName, this._onMessage.bind(this), false);
  }
  _write = (chunk, _encoding, cb) => {
    try {
      const event = new CustomEvent(this._dispatchEventName, {
        detail: JSON.stringify({ ...JSON.parse(chunk), origin: window.location.origin }),
      });
      document.dispatchEvent(event);
    } catch (err) {
      return cb(new Error('InpagePostStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event: CustomEvent) {
    try {
      const msg = event.detail;
      console.log(msg, JSON.parse(msg), 'event====_onMessage');

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
