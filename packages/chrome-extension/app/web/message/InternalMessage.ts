import { LocalStream } from 'extension-streams';
import type { SendResponseParams } from 'types';
import { InternalMessageData } from 'types/SW';

export const timeoutPromise = (delay?: number): Promise<SendResponseParams> => {
  return new Promise((_resolve) => {
    const ids = setTimeout(() => {
      clearTimeout(ids);
      _resolve({ error: 200018, data: 'timeout' });
    }, delay);
  });
};

export default class InternalMessage {
  type: string | number;
  payload: any;
  constructor() {
    this.type = '';
    this.payload = '';
  }

  static placeholder() {
    return new InternalMessage();
  }
  static fromJson(json: any): InternalMessageData {
    return Object.assign(this.placeholder(), json);
  }

  static payload(type: string | number, payload?: any) {
    const p = this.placeholder();
    p.type = type;
    p.payload = payload;
    return p;
  }

  static signal(type: string) {
    const p = this.placeholder();
    p.type = type;
    return p;
  }

  async send() {
    return LocalStream.send(this) as Promise<SendResponseParams>;
  }
}
