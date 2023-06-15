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
  Signature,
  Transaction,
  WalletName,
  WalletState,
} from './response';

export interface IProvider {
  /**
   * Creates a listener on the provider.
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  on(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  on(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  on(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  on(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  on(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  on(event: DappEvents, listener: (...args: any[]) => void): this;

  /**
   * @override
   * Creates a listener on the provider, the listener will be removed after the first time it is triggered
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  once(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  once(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  once(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  once(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  once(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  once(event: DappEvents, listener: (...args: any[]) => void): this;

  /**
   * Remove a listener from the provider
   * @param event - event name that the listener used to listen to
   * @param listener - callback function
   */
  removeListener(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  removeListener(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  removeListener(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  removeListener(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  removeListener(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;

  /**
   * Request(params) is used to call DAPP service, returns a promise that will be fulfilled later.
   * @example basic usage:
   * ```
   * provider.request({ method: "requestAccounts" }).then((result: any) => {
   *   // Do something with the result
   * }).catch(error => console.error('error occurred :', error));
   * ```
   */
  request(params: { method: typeof MethodsBase.ACCOUNTS }): Promise<Accounts>;
  request(params: { method: typeof MethodsBase.CHAIN_ID }): Promise<ChainIds>;
  request(params: { method: typeof MethodsBase.CHAIN_IDS }): Promise<ChainIds>;
  request(params: { method: typeof MethodsBase.CHAINS_INFO }): Promise<ChainsInfo>;
  request(params: { method: typeof MethodsBase.REQUEST_ACCOUNTS }): Promise<Accounts>;
  request(params: { method: typeof MethodsUnimplemented.GET_WALLET_STATE }): Promise<WalletState>;
  request(params: { method: typeof MethodsUnimplemented.GET_WALLET_NAME }): Promise<WalletName>;
  request(params: { method: typeof MethodsBase.NETWORK }): Promise<NetworkType>;
  request(params: {
    method: typeof MethodsBase.SEND_TRANSACTION;
    payload: SendTransactionParams;
  }): Promise<Transaction>;
  request(params: {
    method: typeof MethodsUnimplemented.GET_WALLET_SIGNATURE;
    payload: GetSignatureParams;
  }): Promise<Signature>;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
}

export interface IWeb3Provider extends IProvider {
  /**
   * Returns a chain object that contains chain information and APIs.
   * @param chainId - chain type that you mean to get
   * @returns a chain object
   */
  getChain(chainId: ChainId): Promise<IChain>;
}

export interface IPortkeyProvider extends IWeb3Provider {
  /**
   * Determines whether the current environment is Portkey, if everything works well, it is `true`.
   */
  isPortkey: boolean;
  /**
   * Use it to detect if current Portkey APP's wallet is connected.
   * @returns `true` if connected, otherwise `false`.
   */
  isConnected(): boolean;
}

export interface IInternalProvider extends IProvider {
  emit(event: DappEvents | EventId, response: IResponseInfo): boolean;
  addListener(event: DappEvents, listener: (...args: any[]) => void): this;
}

export interface SendTransactionParams {
  rpcUrl: string;
  chainId: ChainId;
  contractAddress: string;
  method: string;
  params?: readonly unknown[] | object;
}

export interface GetSignatureParams {
  data: string;
}

export type MethodResponse =
  | Accounts
  | ChainIds
  | ChainsInfo
  | WalletState
  | NetworkType
  | Transaction
  | Signature
  | null
  | undefined;

export type ConsoleLike = Pick<Console, 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace'>;

export type BaseProviderOptions = {
  connectionStream: IDappInteractionStream;
  /**
   * The logging API to use.
   *
   * If not provided, it will be `console`.
   */
  logger?: ConsoleLike;

  /**
   * The maximum number of event listeners.
   */
  maxEventListeners?: number;
};

export const portkeyInitEvent = 'portkeyInitEvent';
