import AElf from 'aelf-sdk';
import { BaseChainOptions, ChainId, ChainType, IChain, IChainProvider, IContract } from '@portkey/provider-types';
import { Contract } from './contract';
import { AElfWallet, ChainMethodResult, Block, ChainStatus, TransactionResult } from '@portkey/provider-types/src/aelf';

export abstract class BaseChain {
  protected _request: BaseChainOptions['request'];
  public chainProvider: IChainProvider;
  public rpcUrl: string;
  public type: ChainType;
  public chainId: ChainId;
  constructor({ request, rpcUrl, chainType = 'aelf', chainId }: BaseChainOptions) {
    if (chainType !== 'aelf') throw new Error(`chain type${chainType} is not supported`);
    this.chainProvider = new AElf(new AElf.providers.HttpProvider(rpcUrl)).chain;
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
      request: this._request,
    });
  }
  contractAt(address: string, wallet: AElfWallet): Promise<any> {
    return this.chainProvider.contractAt(address, wallet);
  }
  getBlock(blockHash: string, includeTransactions?: boolean | undefined): Promise<ChainMethodResult<Block>> {
    return this.chainProvider.getBlock(blockHash, includeTransactions);
  }
  getBlockByHeight(blockHeight: number, includeTransactions?: boolean | undefined): Promise<ChainMethodResult<Block>> {
    return this.chainProvider.getBlockByHeight(blockHeight, includeTransactions);
  }
  getBlockHeight(): Promise<ChainMethodResult<number>> {
    return this.chainProvider.getBlockHeight();
  }
  getChainState(...args: unknown[]): Promise<any> {
    return this.chainProvider.getChainState(...args);
  }
  getChainStatus(...args: unknown[]): Promise<ChainMethodResult<ChainStatus>> {
    return this.chainProvider.getChainStatus(...args);
  }
  getContractFileDescriptorSet(contractAddress: string): Promise<ChainMethodResult<string>> {
    return this.chainProvider.getContractFileDescriptorSet(contractAddress);
  }
  getTransactionPoolStatus(): Promise<any> {
    return this.chainProvider.getTransactionPoolStatus();
  }
  getTxResult(transactionId: string): Promise<ChainMethodResult<TransactionResult>> {
    return this.chainProvider.getTxResult(transactionId);
  }
  getTxResults(
    blockHash: string,
    offset?: number | undefined,
    limit?: number | undefined,
  ): Promise<ChainMethodResult<TransactionResult[]>> {
    return this.chainProvider.getTxResults(blockHash, offset, limit);
  }
  sendTransaction(...args: unknown[]): Promise<any> {
    return this.chainProvider.sendTransaction(...args);
  }
  sendTransactions(...args: unknown[]): Promise<any> {
    return this.chainProvider.sendTransactions(...args);
  }
}
