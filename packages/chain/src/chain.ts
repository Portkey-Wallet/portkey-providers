import AElf from 'aelf-sdk';
import { BaseChainOptions, ChainId, ChainType, IChain, IChainProvider, IContract } from '@portkey/provider-types';
import { Contract } from './contract';

export abstract class BaseChain {
  protected _request: BaseChainOptions['request'];
  public chainProvider: IChainProvider;
  public rpcUrl: string;
  public type: ChainType;
  public chainId: ChainId;
  constructor({ request, rpcUrl, chainType = 'aelf', chainId }: BaseChainOptions) {
    if (chainType !== 'aelf') throw new Error(`chain type${chainType} is not supported`);
    this.chainProvider = new AElf(new AElf.providers.HttpProvider(rpcUrl));
    this.rpcUrl = rpcUrl;
    this._request = request;
    this.chainId = chainId;
  }
}

export class Chain extends BaseChain implements IChain {
  getContract(contractAddress: string): IContract {
    return new Contract({
      contractAddress: contractAddress,
      chainId: this.chainId,
      chainProvider: this.chainProvider,
      type: this.type,
    });
  }
}
