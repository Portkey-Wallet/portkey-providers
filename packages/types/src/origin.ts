import { EventMessage } from './event';
import { IResponseType } from './request';

export enum SpecialEvent {
  SYNC = 'sync',
}

export type OriginData = IResponseType | EventMessage;

export type AnyOriginMark = string;

export enum SpecialOriginMark {
  ANY = '*',
  NONE = '/',
}

export const SpecialOriginMarkValues = `${SpecialOriginMark}`;
