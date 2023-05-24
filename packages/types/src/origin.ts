import { EventMessage } from './event';
import { IDappResponseWrapper } from './request';

export interface OriginMessage {
  origin: OriginType;
  type: MessageType;
  /**
   * use ```CryptoManager.decrypt(publicKey,raw)``` to get the decrypted data first.
   */
  raw: string;
}

export type OriginData = IDappResponseWrapper | EventMessage;

export type OriginType = SpecialOriginMark | AnyOriginMark;

export type AnyOriginMark = string;

export enum SpecialOriginMark {
  ANY = '*',
  NONE = '/',
}

export const SpecialOriginMarkValues = `${SpecialOriginMark}`;

export enum MessageType {
  REQUEST = 1,
  EVENT = 2,
}
