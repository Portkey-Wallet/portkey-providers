import {
  CallOptions,
  ChainId,
  ChainType,
  BaseContractOptions,
  IChainProvider,
  IContract,
  SendOptions,
  SendResult,
  ViewResult,
} from '@portkey/provider-types';

export abstract class BaseContract {
  public address: string;
  public chainId: ChainId;
  public chainProvider: IChainProvider;
  public type: ChainType;
  constructor(options: BaseContractOptions) {
    Object.assign(this, options);
  }
}
export class Contract extends BaseContract implements IContract {
  public callContract: IContract;
  constructor(props: BaseContractOptions) {
    super(props);
    this.callContract = this.type === 'aelf' ? new AELFContract(props) : new WB3Contract(props);
  }
  public callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    return this.callContract.callViewMethod(functionName, paramsOption, callOptions);
  }
  public callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    return this.callContract.callSendMethod(functionName, account, paramsOption, sendOptions);
  }
}

export class AELFContract extends BaseContract implements IContract {
  initContract() {}
  public callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions | undefined,
  ): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }
  public callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    throw new Error('Method not implemented.');
  }
}

export class WB3Contract extends BaseContract implements IContract {
  public callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions | undefined,
  ): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }
  public callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    throw new Error('Method not implemented.');
  }
}
