import type { Duplex } from 'readable-stream';
export interface IDappInteractionStream extends Duplex {
  createSubStream(name: string): void;
  createMessageEvent(message: string): void;
}
