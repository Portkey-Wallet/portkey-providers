import type { Duplex } from 'readable-stream';
export interface IDappInteractionStream extends Duplex {
  createSubStream(name: string): void;
  createMessageEvent(message: string): void;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  push(data: any): boolean;
  write(data: any): boolean;
}
