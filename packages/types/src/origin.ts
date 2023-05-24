import { EventMessage } from './event';
import { IDappResponseWrapper } from './request';

export interface CryptoRequest {
  type: MessageType.REQUEST;
  origin: AnyOriginMark;
  command?: SpecialEvent;
  /**
   * use ```CryptoManager.encrypt(publicKey,raw)``` to get the ebcrypted data first.
   */
  raw?: string;
}

export interface CryptoResponse {
  type: MessageType;
  origin: OriginType;
  command?: SpecialEvent;
  /**
   * use ```CryptoManager.decrypt(publicKey,raw)``` to get the decrypted data first.
   */
  raw: string;
}

export enum SpecialEvent {
  SYNC = 'sync',
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

export interface SyncOriginData {
  publicKey: JsonWebKey;
}
