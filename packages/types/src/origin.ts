export enum SpecialEvent {
  SYNC = 'sync',
}

export type AnyOriginMark = string;

export enum SpecialOriginMark {
  ANY = '*',
  NONE = '/',
}

export const SpecialOriginMarkValues = `${SpecialOriginMark}`;
