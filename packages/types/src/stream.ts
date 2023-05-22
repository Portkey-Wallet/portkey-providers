import { Duplex } from 'stream';
import { IDappRequestWrapper } from './request';

export abstract class DappInteractionStream extends Duplex {
  constructor() {
    super();
  }

  createSubStream = (name: String) => {};
  /**
   * this method is abstract, so it must be implemented by the subclass.
   * @example in React Native, you can override this method like this:
   * ```
   * _write=(chunk,encoding,callback)=>{
   *  window.ReactNativeWebView.postMessage(chunk);
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
