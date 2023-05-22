import BaseProvider from './BaseProvider';
import { IWeb3Provider, ChainId, IChain } from '@portkey/provider-types';
import { Chain } from '@portkey/chain';

export abstract class Web3Provider extends BaseProvider implements IWeb3Provider {
  getChain(chainId: ChainId): IChain {
    return new Chain({
      request: this.request,
      // mock
      rpcUrl: 'https://aelf-public-node.aelf.io',
      chainType: 'aelf',
      chainId: chainId,
    });
  }
}
