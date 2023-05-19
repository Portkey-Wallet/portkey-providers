import { IContract } from './contract';
export type ChainId = 'AELF' | 'tDVV' | 'tDVW';
export interface IChain {
  getContract(contractAddress: string): IContract;
}
