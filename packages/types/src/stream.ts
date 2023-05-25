import { Duplex } from 'readable-stream';

declare class Duplex {
  push: (chunk: any, encoding?: BufferEncoding) => boolean;
  on: (event: string, listener: (...args: any[]) => void) => this;
  write: (chunk: any, encoding?: BufferEncoding, callback?: (error?: Error | null | undefined) => void) => boolean;
}

export abstract class IDappInteractionStream extends Duplex {
  abstract createSubStream(name: string): void;
  abstract createMessageEvent(message: string): void;
}
