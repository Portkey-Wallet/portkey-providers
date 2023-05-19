import { IChain, IContract } from './types';

export class Chain implements IChain {
  getContract(contractAddress: string): IContract {
    throw new Error('Method not implemented.');
  }
}
