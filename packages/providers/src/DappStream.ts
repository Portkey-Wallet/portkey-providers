import {
  NotificationEvents,
  IDappInteractionStream,
  IRequestParams,
  IResponseType,
  ResponseCode,
} from '@portkey/provider-types';
import { Duplex } from 'readable-stream';

export abstract class DappInteractionStream extends Duplex implements IDappInteractionStream {
  constructor() {
    super();
  }
  /**
   * this method is not implemented yet.
   */
  createSubStream = (_name: String) => {};

  _read = (_size?: number | undefined): void => {};

  /**
   *
   * @param message the message content you want to send to the dapp
   */
  createMessageEvent = (message: string) => {
    this.push({ eventName: NotificationEvents.MESSAGE, info: { code: ResponseCode.INTERNAL_ERROR } });
  };

  public push(chunk: IRequestParams | IResponseType, encoding?: BufferEncoding | undefined): boolean {
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

/**
 * Use SubStream to create a new Stream port used for other purpose.
 * For example, you can create a SubStream to deal with RPC connection, and an error won't make the parent stream crash.
 */
export class SubStream extends Duplex {
  private parentStream: Duplex;
  constructor(parentStream: Duplex, public name: string) {
    super();
    this.parentStream = parentStream;
  }
  _read(_size: number): void {}
  _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
    this.parentStream?.push(Object.assign({}, chunk, { name: this.name }));
    callback();
  }
}

export interface StreamData {
  name: string;
  chunk: any;
}
