import { NotificationEvents, IDappInteractionStream, ResponseCode, IResponseType } from '@portkey/provider-types';
import { Duplex } from 'readable-stream';

export abstract class DappInteractionStream extends Duplex implements IDappInteractionStream {
  constructor() {
    super();
  }
  createSubStream = (_name: String) => {};

  _read = (_size?: number | undefined): void => {};

  /**
   *
   * @param message the message content you want to send to the dapp
   */
  createMessageEvent = (msg: string) => {
    this.write(
      JSON.stringify({
        eventName: NotificationEvents.MESSAGE,
        info: { code: ResponseCode.SUCCESS, msg, data: msg },
      } as IResponseType),
    );
  };

  public push(chunk: any, encoding?: BufferEncoding | undefined): boolean {
    return super.push(chunk, encoding);
  }

  /**
   * this method is abstract, so it must be implemented by the subclass.
   * @example in React Native Webview, you can override this method like this(for provider):
   * ```
   * _write=(chunk,encoding,callback)=>{
   *  window.ReactNativeWebView.postMessage(chunk);
   * callback();
   * }
   * ```
   * @example and in React Native, you may override this method like this:
   * ```
   * _write=(chunk, encoding, callback)=>{
   * const {eventId, params} = chunk;
   * webViewRef.injectJavaScript(`window.portkey.emit(${eventId},JSON.stringify(params))`);
   * callback();
   * }
   * ```
   */
  abstract _write(
    chunk: ArrayBuffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void;
}

export interface StreamData {
  name: string;
  chunk: any;
}
