import { NotificationEvents, IDappInteractionStream, ResponseCode, IResponseType } from '@portkey/provider-types';
import { Duplex } from 'readable-stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';

export abstract class DappInteractionStream extends Duplex implements IDappInteractionStream {
  constructor() {
    super();
  }

  private _subStreamMap: Map<String, SubStream> = new Map();

  /**
   * this method is not implemented yet.
   */
  public createSubStream = (name: string): SubStream => {
    if (this._subStreamMap.has(name)) {
      return this._subStreamMap.get(name) ?? new SubStream(this, name);
    }
    const subStream = new SubStream(this, name);
    this._subStreamMap.set(name, subStream);
    return subStream;
  };

  _read = (_size?: number | undefined): void => {};

  /**
   *
   * @param msg the message content you want to send to the dapp
   */
  createMessageEvent = (msg: string) => {
    this.write(
      JSON.stringify({
        eventName: NotificationEvents.MESSAGE,
        info: { code: ResponseCode.SUCCESS, msg },
      } as IResponseType),
    );
  };

  public push(chunk: any, encoding?: BufferEncoding | undefined): boolean {
    return super.push(chunk, encoding);
  }

  /**
   * This method is abstract, so it must be implemented by the subclass.
   * @example In React Native Webview, you can override this method like this(for provider):
   * ```
   * _write=(chunk,encoding,callback)=>{
   * // Remember that chunk is ArrayBuffer, so you need to decode it first.
   * const data = chunk.toString();
   *  window.ReactNativeWebView.postMessage(data);
   * callback();
   * }
   * ```
   * @example And in React Native, you may override this method like this:
   * ```
   * _write=(chunk, encoding, callback)=>{
   * const {eventId, params} = JSON.parse(chunk.toString());
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
  public name: string;
  constructor(parentStream: Duplex, name: string) {
    super();
    this.parentStream = parentStream;
    this.name = name;
    this.connect();
  }
  _read = (_size: number) => {};
  _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
    this.parentStream?.write(chunk.toString());
    return callback();
  }

  /**
   * parentStream => duplex => this => duplex => parentStream
   */
  private connect = () => {
    const duplex = new ObjectMultiplex();
    pump(this.parentStream, duplex, this.parentStream, e => {
      console.error(`SubStream ${this.name} disconnected:`, e);
    });
    pump(duplex, this, duplex);
  };
}

export interface StreamData {
  name: string;
  chunk: any;
}
