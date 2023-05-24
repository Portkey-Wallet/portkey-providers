import { EventMessage } from './event';
import { AnyOriginMark } from './origin';
import { IDappRequestResponse, IDappRequestWrapper } from './request';

export interface IOperator extends OriginBehaviour {
  handleRequestMessage(message: string): Promise<void>;
  handleRequest(request: IDappRequestWrapper): Promise<IDappRequestResponse>;
  publishEvent(event: EventMessage): void;
}

export interface OriginBehaviour {
  readonly origins: Array<{ origin: AnyOriginMark; publicKey: JsonWebKey }>;
  isVavidOrigin(origin: AnyOriginMark): boolean;
  originSync(origin: AnyOriginMark, raw: string): void;
}
