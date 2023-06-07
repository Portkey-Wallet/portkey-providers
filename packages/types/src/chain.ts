import { AElfChainMethods, AElfWallet, ChainMethodResult } from './aelf';
import { IContract } from './contract';
import { IProvider } from './provider';
export type ChainId = 'AELF' | 'tDVV' | 'tDVW';
export type ChainType = 'aelf' | 'ethereum';
export type Address = string;
export interface IChain extends AElfChainMethods {
  rpcUrl: string;
  type: ChainType;
  chainId: ChainId;
  getContract(contractAddress: string): IContract;
  /** @deprecated use getContract */
  contractAt<T = any>(address: string, wallet: AElfWallet): Promise<ChainMethodResult<T>>;
}

export type IChainProvider = AElfChainMethods;

export type BaseChainOptions = {
  rpcUrl: string;
  chainType?: ChainType;
  chainId: ChainId;
  request: IProvider['request'];
};
