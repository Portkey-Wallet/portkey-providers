/**
 * @remarks
 * PostStream By `document.dispatchEvent` / `document.addEventListener`
 */
import { DappInteractionStream } from '@portkey/providers';
import { IResponseType } from '@portkey/provider-types';
import { PortkeyDocumentPostOptions } from '../types';
const noop = () => undefined;

export class ContentPostStream extends DappInteractionStream {
  private _name: string;
  private _origin: string;
  private _listenerEventName: string;
  private _dispatchEventName: string;

  _read = noop;
  constructor({
    targetWindow,
    name,
    listenerEventName = 'portkey-message-from-inpage',
    dispatchEventName = 'portkey-message-from-content',
  }: PortkeyDocumentPostOptions) {
    super();
    this._name = name;
    this._listenerEventName = listenerEventName;
    this._dispatchEventName = dispatchEventName;
    this._origin = targetWindow ? '*' : location.origin;
    document.addEventListener<any>(this._listenerEventName, this._onMessage.bind(this), false);
  }
  _write = (chunk: any, _encoding?: string, cb?: (error?: Error | null | undefined) => void) => {
    try {
      const event = new CustomEvent(this._dispatchEventName, {
        detail: JSON.stringify({ ...JSON.parse(chunk), origin: window.location.origin }),
      });
      document.dispatchEvent(event);
    } catch (err) {
      return cb?.(new Error('PortkeyPostStream - disconnected'));
    }
    return cb?.();
  };

  send = (params: IResponseType) => {
    this.write(JSON.stringify(params));
  };

  _onMessage(event: CustomEvent): void {
    try {
      console.log(this._name, this._origin, 'ContentPostStream===_name, _origin');
      const msg = event.detail;
      console.log(msg, JSON.parse(msg), 'ContentPostStream====detail');

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
