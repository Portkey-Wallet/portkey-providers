import { DappEvents, EventId, NotificationEvents } from './event';
import { IResponseInfo, MethodsBase, MethodsUnimplemented, RequestOption } from './request';
import type { IDappInteractionStream } from './stream';
import { ChainId, IChain } from './chain';
import {
  Accounts,
  ChainIds,
  ChainsInfo,
  ConnectInfo,
  NetworkType,
  ProviderErrorType,
  Transaction,
  WalletState,
} from './response';

export interface IProvider {
  // on
  on(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  on(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  on(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  on(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  on(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  on(event: DappEvents, listener: (...args: any[]) => void): this;

  once(event: DappEvents, listener: (...args: any[]) => void): this;
  // remove
  removeListener(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  removeListener(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  removeListener(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  removeListener(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  removeListener(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;

  // request
  request<T = Accounts>(params: { method: typeof MethodsBase.ACCOUNTS }): Promise<T>;
  request<T = ChainIds>(params: { method: typeof MethodsBase.CHAIN_ID }): Promise<T>;
  request<T = ChainIds>(params: { method: typeof MethodsBase.CHAIN_IDS }): Promise<T>;
  request<T = ChainsInfo>(params: { method: typeof MethodsBase.CHAINS_INFO }): Promise<T>;
  request<T = Accounts>(params: { method: typeof MethodsBase.REQUEST_ACCOUNTS }): Promise<T>;
  request<T = WalletState>(params: { method: typeof MethodsUnimplemented.GET_WALLET_STATE }): Promise<T>;
  request<T = Transaction>(params: {
    method: typeof MethodsBase.SEND_TRANSACTION;
    payload: SendTransactionParams;
  }): Promise<T>;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
}

export interface IWeb3Provider extends IProvider {
  getChain(chainId: ChainId): Promise<IChain>;
}

export interface IPortkeyProvider extends IWeb3Provider {
  isPortkey: true;
  isConnected(): boolean;
}

export interface IInternalProvider extends IProvider {
  emit(event: DappEvents | EventId, response: IResponseInfo): boolean;
  once(event: DappEvents, listener: (...args: any[]) => void): this;
  addListener(event: DappEvents, listener: (...args: any[]) => void): this;
}

export interface KeyPairJSON {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

export interface SendTransactionParams {
  rpcUrl: string;
  chainId: ChainId;
  contractAddress: string;
  method: string;
  params?: readonly unknown[] | object;
}

export type MethodResponse = Accounts | ChainIds | ChainsInfo | WalletState | Transaction | null | undefined;

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
