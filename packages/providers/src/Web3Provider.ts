import BaseProvider from './BaseProvider';
import { IWeb3Provider, ChainId, IChain } from '@portkey/provider-types';

export default abstract class Web3Provider extends BaseProvider implements IWeb3Provider {
  getChain(chainId: ChainId): IChain {
    throw new Error('Method not implemented.');
  }
}
