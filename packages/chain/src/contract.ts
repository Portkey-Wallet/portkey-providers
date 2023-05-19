import { CallOptions, IContract, SendOptions, SendResult, ViewResult } from './types';

export class Contract implements IContract {
  callViewMethod<T = any>(functionName: string, paramsOption?: any, callOptions?: CallOptions): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }
  callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions,
  ): Promise<SendResult<T>> {
    throw new Error('Method not implemented.');
  }
}
