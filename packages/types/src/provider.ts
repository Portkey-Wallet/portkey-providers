import { DappEvents, EventId, EventResponse } from './event';
import { IDappRequestArguments, IDappRequestResponse, RPCMethodsBase } from './request';
import type { Duplex } from 'stream';
import type { IDappInteractionStream } from './stream';
import { ChainId, IChain } from './chain';
import { AnyOriginMark } from './origin';

export interface IStreamBehaviour {
  setupStream: (companionStream: Duplex) => void;
  onConnectionDisconnect: (error: Error) => void;
}

export interface IProvider extends IStreamBehaviour, CryptoBehaviour {
  init(): Promise<void | never>;
  on(event: DappEvents, listener: (...args: any[]) => void): this;
  once(event: DappEvents, listener: (...args: any[]) => void): this;
  emit(event: DappEvents | EventId, response: IDappRequestResponse | EventResponse): boolean;
  addListener(event: DappEvents, listener: (...args: any[]) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;
  request(params: IDappRequestArguments): Promise<IDappRequestResponse>;
  request(params: {
    method: RPCMethodsBase.SEND_TRANSACTION;
    payload?: SendTransactionParams;
  }): Promise<IDappRequestResponse>;
}

export interface CryptoBehaviour {
  readonly keyPair: KeyPairJSON;
}

export interface KeyPairJSON {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

export interface ExchangeKeyRequestData {
  publicKey: JsonWebKey;
  mark: AnyOriginMark;
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
};

export const portkeyInitEvent = 'portkeyInitEvent';
