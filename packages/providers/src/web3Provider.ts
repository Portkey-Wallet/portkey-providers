import BaseProvider from './baseProvider';
import { IWeb3Provider, ChainId, IChain, MethodsBase, ProviderError, ResponseCode } from '@portkey/provider-types';
import { Chain } from '@portkey/chain';

export abstract class Web3Provider extends BaseProvider implements IWeb3Provider {
  async getChain(chainId: ChainId): Promise<IChain> {
    const chainIdsInfo = await this.request({ method: MethodsBase.CHAINS_INFO });
    const chainInfos = chainIdsInfo[chainId]?.[0];
    if (!chainInfos) throw new ProviderError('This chainId is not supported', ResponseCode.ERROR_IN_PARAMS);
    return new Chain({
      request: this.request,
      rpcUrl: chainInfos.endPoint,
      chainType: 'aelf',
      chainId: chainId,
    });
  }
}
