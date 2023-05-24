import { CentralEthereumEvents, IDappInteractionStream, IDappRequestWrapper } from '@portkey/provider-types';
import { Duplex } from 'stream';

export abstract class DappInteractionStream extends Duplex implements IDappInteractionStream {
  constructor() {
    super();
  }

  /**
   * this method is not implemented yet.
   */
  createSubStream = (_name: String) => {};

  /**
   *
   * @param message the message content you want to send to the dapp
   */
  createMessageEvent = (message: string) => {
    this.push({ event: CentralEthereumEvents.MESSAGE, msg: message });
  };

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
    chunk: IDappRequestWrapper,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void;
}

/**
 * Use SubStream to create a new Stream port used for other perpose.
 * For example, you can create a SubStream to deal with RPC connection, and an error won't make the parent stream crash.
 */
export class SubStream extends Duplex {
  private parentStream: Duplex;
  constructor(parentStream: Duplex, public name: string) {
    super();
    this.parentStream = parentStream;
  }
  _read(_size: number): void {}
  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
    this.parentStream?.push({ chunk: Object.assign({}, chunk, { name: this.name }), encoding });
    callback();
  }
}

export interface StreamData {
  name: string;
  chunk: any;
}
