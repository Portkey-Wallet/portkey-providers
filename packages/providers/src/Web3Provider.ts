import BaseProvider from './BaseProvider';
import { IWeb3Provider, ChainId, IChain, RPCMethodsBase, ProviderError } from '@portkey/provider-types';
import { Chain } from '@portkey/chain';

export abstract class Web3Provider extends BaseProvider implements IWeb3Provider {
  async getChain(chainId: ChainId): Promise<IChain> {
    const chainIdsInfo = await this.request({ method: RPCMethodsBase.CHAINS_INFO });
    const chainInfos = chainIdsInfo[chainId]?.[0];
    if (!chainInfos) throw new ProviderError('This chainId is not supported', 40002);
    return new Chain({
      request: this.request,
      rpcUrl: chainInfos.endPoint,
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

  isConnected() {
    return this.state.isConnected;
  }
}
