import { ChainId, ChainType, IChainProvider } from './chain';
import { IProvider } from './provider';

export interface BaseContractOptions {
  chainId: ChainId;
  chainProvider: IChainProvider;
  // contractABI?: AbiItem[];
  contractAddress: string;
  type: ChainType;
  request: IProvider['request'];
  rpcUrl: string;
}
