import { IRequestParams, IResponseType } from './request';

export interface IOperator {
  handleRequestMessage(message: string): Promise<void>;
  handleRequest(request: IRequestParams): Promise<IResponseType>;
  publishEvent(event: IResponseType): void;
}
