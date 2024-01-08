import { IDappInteractionStream, IResponseType, NotificationEvents, ResponseCode } from '@portkey/provider-types';
import { Duplex } from 'readable-stream';

export class PortkeyBridgeStream extends Duplex implements IDappInteractionStream {
  protected _name: string;
  protected _origin: string;
  protected _postWindow: any;
  protected _originWindow: any;
  constructor({ postWindow, targetWindow, name, originWindow }: any) {
    super();
    this._name = name;
    this._origin = targetWindow ? '*' : window.location.origin;
    this._postWindow = postWindow;
    this._originWindow = originWindow;
    this._originWindow.addEventListener('message', this._onMessage.bind(this), false);
  }
  createSubStream = (_name: String) => undefined;

  _read = (_size?: number | undefined): void => undefined;
  /**
   * Creates a message event to the other side, based on which side the stream is on - provider or operator.
   * @param message - the message content you want to send to the dapp
   */
  createMessageEvent = (msg: string) => {
    this.write(
      JSON.stringify({
        eventName: NotificationEvents.MESSAGE,
        info: { code: ResponseCode.SUCCESS, msg, data: msg },
      } as IResponseType),
    );
  };
  _write = (msg: any, _encoding: string, cb: (error?: Error | null) => void) => {
    try {
      this._postWindow.postMessage(JSON.stringify({ ...JSON.parse(msg), origin: window.location.origin }));
    } catch (err) {
      return cb(new Error('PortkeyPostStream - disconnected'));
    }
    return cb();
  };
  _onMessage(event: MessageEvent<any>) {
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
