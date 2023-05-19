import { Duplex } from 'stream';

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
