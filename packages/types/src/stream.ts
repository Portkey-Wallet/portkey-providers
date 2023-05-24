import type { Duplex } from 'stream';
export interface IDappInteractionStream extends Duplex {
  createSubStream(name: string): void;
  createMessageEvent(message: string): void;
}
