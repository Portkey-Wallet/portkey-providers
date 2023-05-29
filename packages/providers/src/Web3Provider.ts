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
  /**
   * **MUST** be called after instantiation to complete initialization.
   *
   * Calls `getProviderState` and passes the result to
   * {@link BaseProvider._initializeState}. Logs an error if getting initial state
   * fails. Throws if called after initialization has completed.
   */
  getInitialize() {
    return this.initializeState();
  }
}
