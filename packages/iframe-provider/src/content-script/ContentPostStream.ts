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
  private _targetOrigin: string;
  private _listenerEventName: string;
  private _dispatchEventName: string;

  _read = noop;
  constructor({
    targetOrigin,
    name,
    listenerEventName = 'portkey-message-from-inpage-iframe',
    dispatchEventName = 'portkey-message-from-content-iframe',
  }: PortkeyDocumentPostOptions) {
    super();
    this._name = name;
    this._listenerEventName = listenerEventName;
    this._dispatchEventName = dispatchEventName;
    this._targetOrigin = targetOrigin ?? '*';
    console.log(this._listenerEventName, '_listenerEventName');

    window.addEventListener<any>('message', this._onMessage.bind(this), false);
  }
  _write = (chunk: any, _encoding?: string, cb?: (error?: Error | null | undefined) => void) => {
    try {
      window.parent.postMessage(
        {
          eventName: this._dispatchEventName,
          detail: JSON.stringify({ ...JSON.parse(chunk), origin: window.location.origin }),
        },
        this._targetOrigin,
      );
    } catch (err) {
      return cb?.(new Error('ContentPostStream - disconnected'));
    }
    return cb?.();
  };

  send = (params: IResponseType) => {
    this.write(JSON.stringify(params));
  };

  _onMessage(event: any): void {
    try {
      const msg = event.data?.detail;
      console.log(this._name, this._targetOrigin, 'ContentPostStream===_name, _origin');

      if (typeof msg !== 'string') return;
      const data = JSON.parse(msg);

      // validate message
      if (!data || typeof data !== 'object') return;
      if (data.target && data.target !== this._name) return;

      if (data.payload !== undefined && typeof data.payload !== 'object' && data.payload !== null) return;

      this.push(msg);
    } catch (error) {
      console.log(error, 'ContentPostStream: Portkey send message error');
    }
  }
}
