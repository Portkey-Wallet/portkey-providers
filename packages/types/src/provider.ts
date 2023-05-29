import { DappEvents, EventId, EventResponse } from './event';
import { IRequestParams, IResponseInfo } from './request';
import type { Duplex } from 'readable-stream';
import type { IDappInteractionStream } from './stream';
import { ChainId, IChain } from './chain';

export interface IStreamBehaviour {
  setupStream: (companionStream: Duplex) => void;
  onConnectionDisconnect: (error: Error) => void;
}

export interface IProvider extends IStreamBehaviour {
  on(event: DappEvents, listener: (...args: any[]) => void): this;
  once(event: DappEvents, listener: (...args: any[]) => void): this;
  emit(event: DappEvents | EventId, response: IResponseInfo | EventResponse): boolean;
  addListener(event: DappEvents, listener: (...args: any[]) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;
  request<T = any>(params: IRequestParams): Promise<IResponseInfo<T>>;
  request<T = any>(params: { method: 'sendTransaction'; payload?: SendTransactionParams }): Promise<IResponseInfo<T>>;
}

export interface KeyPairJSON {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

export interface SendTransactionParams {
  chainId: ChainId;
  contractAddress: string;
  method: string;
  params?: readonly unknown[] | object;
}

export interface IWeb3Provider extends IProvider {
  getChain(chainId: ChainId): IChain;
}

export type ConsoleLike = Pick<Console, 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace'>;

export type BaseProviderOptions = {
  connectionStream: IDappInteractionStream;
  /**
   * The logging API to use.
   */
  logger?: ConsoleLike;

  /**
   * The maximum number of event listeners.
   */
  maxEventListeners?: number;
  // useCrypto?: boolean;
};

export const portkeyInitEvent = 'portkeyInitEvent';
