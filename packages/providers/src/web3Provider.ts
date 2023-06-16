import BaseProvider from './baseProvider';
import {
  IWeb3Provider,
  ChainId,
  MethodsBase,
  ProviderError,
  ResponseCode,
  IAElfChain,
  IChain,
} from '@portkey/provider-types';
import { AElfChain } from '@portkey/chain';

export abstract class Web3Provider extends BaseProvider implements IWeb3Provider {
  async getChain<T extends IChain = IAElfChain>(chainId: ChainId): Promise<T> {
    // Ethereum chain is not yet supported
    if (typeof chainId === 'number') throw new Error('chainId does not support');

    const chainIdsInfo = await this.request({ method: MethodsBase.CHAINS_INFO });
    const chainInfos = chainIdsInfo[chainId]?.[0];
    if (!chainInfos) throw new ProviderError('This chainId is not supported', ResponseCode.ERROR_IN_PARAMS);
    return new AElfChain({
      request: this.request,
      rpcUrl: chainInfos.endPoint,
      chainType: 'aelf',
      chainId: chainId,
    }) as unknown as T;
  }
}
