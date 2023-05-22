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
  RPCMethodsBase,
  SendTransactionParams,
} from '@portkey/provider-types';
import { formatFunctionName, getWallet } from './utils';

export abstract class BaseContract {
  public address: string;
  public chainId: ChainId;
  public chainProvider: IChainProvider;
  public type: ChainType;
  protected _request: BaseContractOptions['request'];
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
  public viewContract?: any;
  constructor(props: BaseContractOptions) {
    super(props);
    this.initContract();
  }
  private async initContract() {
    // init viewContract by common wallet
    this.viewContract = await this.chainProvider.contractAt(this.address, getWallet());
  }
  checkContract = async () => {
    if (!this.viewContract) await this.initContract();
  };
  public async callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    _callOptions?: CallOptions | undefined,
  ): Promise<T> {
    await this.checkContract();
    const req = this.viewContract[formatFunctionName(functionName)].call(paramsOption);
    if (req?.error) throw req.error;
    if (req?.result || req?.result === null) return req.result;
    return req;
  }
  public async callSendMethod<T = any>(
    functionName: string,
    _account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    return this._request({
      method: RPCMethodsBase.SEND_TRANSACTION,
      payload: {
        chainId: this.chainId,
        contractAddress: this.address,
        method: functionName,
        params: {
          paramsOption,
          sendOptions,
        },
      } as SendTransactionParams,
    });
  }
}

export class WB3Contract extends BaseContract implements IContract {
  public callViewMethod<T = any>(
    _functionName: string,
    _paramsOption?: any,
    _callOptions?: CallOptions | undefined,
  ): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }
  public callSendMethod<T = any>(
    _functionName: string,
    _account: string,
    _paramsOption?: any,
    _sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    throw new Error('Method not implemented.');
  }
}
