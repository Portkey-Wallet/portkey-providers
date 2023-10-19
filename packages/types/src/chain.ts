import type { IAElfRPCMethods, AElfWallet, ChainMethodResult, IContract } from '@portkey/types';
import { IProvider } from './provider';
export type ChainId = 'AELF' | 'tDVV' | 'tDVW';
export type ChainType = 'aelf' | 'ethereum';
export type Address = string;

export interface IChain {
  rpcUrl: string;
  type: ChainType;
  chainId: ChainId;
  getContract(contractAddress: string): IContract;
}

export interface IAElfChain extends IAElfRPCMethods, IChain {
  /** @deprecated use getContract */
  contractAt<T = any>(address: string, wallet: AElfWallet): Promise<ChainMethodResult<T>>;
}

export type IChainProvider = IAElfRPCMethods;

export type BaseChainOptions = {
  rpcUrl: string;
  chainType?: ChainType;
  chainId: ChainId;
  request: IProvider['request'];
};
