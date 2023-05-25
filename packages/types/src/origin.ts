import { EventMessage } from './event';
import { IDappResponseWrapper } from './request';

export interface CryptoRequest {
  origin: AnyOriginMark;
  command?: SpecialEvent;
  /**
   * use ```CryptoManager.encrypt(encryptKey,raw)``` to get the encrypted data first.
   */
  raw?: string;
}

export interface CryptoResponse {
  origin: OriginType;
  command?: SpecialEvent;
  /**
   * use ```CryptoManager.decrypt(encryptKey,raw)``` to get the decrypted data first.
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

export interface SyncOriginData {
  publicKey: JsonWebKey;
  useCrypto: boolean;
}
