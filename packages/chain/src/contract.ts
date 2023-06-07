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
  MethodsBase,
  SendTransactionParams,
  ProviderError,
  ResponseCode,
  Transaction,
} from '@portkey/provider-types';
import { COMMON_WALLET, formatFunctionName, getTxResult, handleContractError } from './utils';

export abstract class BaseContract {
  public address: string;
  public chainId: ChainId;
  public chainProvider: IChainProvider;
  public type: ChainType;
  public rpcUrl: string;
  protected _request: BaseContractOptions['request'];
  constructor(options: BaseContractOptions) {
    Object.assign(this, options);
    this.address = options.contractAddress;
    this._request = options.request;
  }
}
export class Contract extends BaseContract implements IContract {
  public callContract: IContract;
  constructor(props: BaseContractOptions) {
    super(props);
    this.callContract = this.type === 'aelf' ? new AELFContract(props) : new WEB3Contract(props);
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
    this.viewContract = await this.chainProvider.contractAt(this.address, COMMON_WALLET);
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
    await this.checkContract();
    if (!this.viewContract[functionName])
      throw new ProviderError(`Contract ${this.address} does not exist ${functionName}`, ResponseCode.CONTRACT_ERROR);
    // if (this.viewContract[functionName].call)
    //   throw new ProviderError(`The method is the view method ${functionName}`, ResponseCode.ERROR_IN_PARAMS);
    const { onMethod = 'transactionHash' } = sendOptions || {};

    const { transactionId } = await this._request<Transaction>({
      method: MethodsBase.SEND_TRANSACTION,
      payload: {
        rpcUrl: this.rpcUrl,
        chainId: this.chainId,
        contractAddress: this.address,
        method: functionName,
        params: {
          paramsOption,
          sendOptions,
        },
      } as SendTransactionParams,
    });
    if (onMethod === 'receipt') {
      try {
        const txResult = await getTxResult(this.chainProvider, transactionId);
        return { data: txResult, transactionId };
      } catch (error) {
        throw new ProviderError(handleContractError(error).message, ResponseCode.CONTRACT_ERROR, { transactionId });
      }
    }
    return { transactionId };
  }
}

export class WEB3Contract extends BaseContract implements IContract {
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
