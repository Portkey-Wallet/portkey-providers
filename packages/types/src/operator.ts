import { EventMessage } from './event';
import { AnyOriginMark } from './origin';
import { IRequestParams, IResponseType } from './request';

export interface IOperator {
  handleRequestMessage(message: string): Promise<void>;
  handleRequest(request: IRequestParams): Promise<IResponseType>;
  publishEvent(event: EventMessage): void;
}

export interface OriginRecord {
  origin: AnyOriginMark;
  publicKey?: JsonWebKey;
  useCrypto?: boolean;
}
