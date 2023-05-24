import { EventMessage } from './event';
import { IDappRequestResponse, IDappRequestWrapper } from './request';

export interface IOperator {
  handleRequestMessage(message: string): void;
  handleRequest(request: IDappRequestWrapper): Promise<IDappRequestResponse>;
  publishEvent(event: EventMessage): void;
}
