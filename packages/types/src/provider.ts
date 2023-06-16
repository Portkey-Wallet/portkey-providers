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
   * When the provider is connected to an operator, this event will be triggered.
   * ```
   * provider.on('connect', (connectInfo: ConnectInfo) => {
   *  console.log('current chainIds: ', connectInfo.chainIds);
   * });
   * ```
   */
  on(event: typeof NotificationEvents.CONNECTED, listener: (connectInfo: ConnectInfo) => void): this;
  /**
   * When network changes, this event will be triggered.
   * ```
   * provider.on('networkChanged', (networkType: NetworkType) => {
   * console.log('current networkType is : ', networkType);
   * });
   * ```
   */
  on(event: typeof NotificationEvents.NETWORK_CHANGED, listener: (networkType: NetworkType) => void): this;
  /**
   * When current APP's supported chain changes, this event will be triggered.
   * ```
   * provider.on('chainChanged', (chainIds: ChainIds) => {
   * console.log('current chainIds: ', chainIds);
   * });
   * ```
   */
  on(event: typeof NotificationEvents.CHAIN_CHANGED, listener: (chainIds: ChainIds) => void): this;
  /**
   * If the CA address changes, this event will be triggered.
   * ```
   * provider.on('accountsChanged', (accounts: Accounts) => {
   * alert('current account has changed, please refresh the page.');
   * console.log('current accounts: ', accounts);
   * });
   * ```
   */
  on(event: typeof NotificationEvents.ACCOUNTS_CHANGED, listener: (accounts: Accounts) => void): this;
  /**
   * When error occurs, the provider will be disconnected and this event will be triggered.
   * ```
   * provider.on('disconnect', (error: ProviderErrorType) => {
   * alert('sorry, the provider has been disconnected, please refresh the page.');
   * console.log('facing error: ', error);
   * ```
   */
  on(event: typeof NotificationEvents.DISCONNECTED, listener: (error: ProviderErrorType) => void): this;
  /**
   * Creates a listener on the provider.
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  on(event: DappEvents, listener: (...args: any[]) => void): this;

  /**
   * @override
   * Creates a listener on the provider, the listener will be removed after the first time it is triggered.
   *
   * Also see {@link IProvider.on} for more details.
   *
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
   * Remove a listener from the provider.
   *
   * Also see {@link IProvider.on} for more details.
   *
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
   * Used for requesting the current chainId.
   * ```
   * const chainId = await provider.request({ method: 'chainId' });
   * // Although the chainId object is an array, it only contains one chainId.
   * console.log('current chainId:',chainId[0]);
   * ```
   */
  request(params: { method: typeof MethodsBase.CHAIN_ID }): Promise<ChainIds>;
  /**
   * Used for requesting the supported chainIds.
   * ```
   * const chainIds = await provider.request({ method: 'chainIds' });
   * console.log('all the supported chainIds:',chainIds);
   * ```
   */
  request(params: { method: typeof MethodsBase.CHAIN_IDS }): Promise<ChainIds>;
  /**
   * Used for requesting the on-chain info.
   * ```
   * const chainsInfo = await provider.request({ method: 'chainsInfo' });
   * console.log('all the on-chain info:', chainsInfo);
   * ```
   */
  request(params: { method: typeof MethodsBase.CHAINS_INFO }): Promise<ChainsInfo>;
  /**
   * Used for detecting which type of network the APP is using.
   * ```
   * const networkType = await provider.request({ method: 'network' });
   * console.log('current network type is :',networkType);
   * ```
   */
  request(params: { method: typeof MethodsBase.NETWORK }): Promise<NetworkType>;
  /**
   * Used for the `CONNECT` permission, if so, returns the `Accounts` info.
   *
   * ```
   * try {
   *  const accounts = await provider.request({ method: 'requestAccounts' });
   *  console.log(accounts);
   * }catch(e){
   *  // An error will be thrown if the user denies the permission request.
   *  console.log('user denied the permission request');
   * }
   * ```
   */
  request(params: { method: typeof MethodsBase.REQUEST_ACCOUNTS }): Promise<Accounts>;
  /**
   * Used for requesting the current accounts, and it requires the `CONNECT` permission.
   *
   * __NOTICE__: You must call `request({ method:'requestMethod' })` first for the permission.
   * If not, this method will throw an exception.
   *
   * ```
   * const accounts = await provider.request({ method: 'accounts' });
   * console.log(accounts);
   * ```
   */
  request(params: { method: typeof MethodsBase.ACCOUNTS }): Promise<Accounts>;
  /**
   * Returns an object representing the current state of the wallet.
   *
   * __NOTICE__: You must call `request({ method:'requestMethod' })` first for the permission.
   * If not, this method will throw an exception.
   *
   * ```
   * const walletState = await provider.request({ method: 'wallet_getWalletState' });
   * console.log('walletState:', walletState);
   * ```
   */
  request(params: { method: typeof MethodsUnimplemented.GET_WALLET_STATE }): Promise<WalletState>;
  /**
   * Returns current wallet's name.
   *
   * __NOTICE__: You must call `request({ method:'requestMethod' })` first for the permission.
   * If not, this method will throw an exception.
   *
   * ```
   * const walletName = await provider.request({ method: 'wallet_getWalletName' });
   * console.log('walletName:', walletName);
   * ```
   */
  request(params: { method: typeof MethodsUnimplemented.GET_WALLET_NAME }): Promise<WalletName>;
  /**
   * Send a transaction to the blockchain, and returns its id.
   *
   * __NOTICE__: You must call `request({ method:'requestMethod' })` first for the permission.
   * If not, this method will throw an exception.
   *
   * ```
   * try {
   *  const txId = await provider.request({
   *    method: 'sendTransaction',
   *    payload: {
   *      to: '0x...',
   *      ...
   *    },
   *  });
   *  if(!txId) throw new Error('transaction failed!');
   *  console.log('transaction success! transaction id:', txId);
   * } catch (e) {
   * // An error will be thrown if the user denies the permission request, or other issues.
   * ...
   * }
   * ```
   */
  request(params: {
    method: typeof MethodsBase.SEND_TRANSACTION;
    payload: SendTransactionParams;
  }): Promise<Transaction>;
  /**
   * Used for signing a message, and returns the signature.
   *
   * __NOTICE__: You must call `request({ method:'requestMethod' })` first for the permission.
   * If not, this method will throw an exception.
   *
   * ```
   * try {
   *  const signature = await provider.request({
   *    method: 'wallet_getSignature',
   *    payload: {
   *      message: '0x...',
   *    },
   *  });
   *  if (!signature) throw new Error('sign failed!');
   *  console.log('sign success! signature:', signature);
   * } catch (e) {
   * // An error will be thrown if the user denies the permission request, or other issues.
   * ...
   * }
   * ```
   */
  request(params: {
    method: typeof MethodsUnimplemented.GET_WALLET_SIGNATURE;
    payload: GetSignatureParams;
  }): Promise<Signature>;
  /**
   * Request(params) is used to call DAPP service, returns a promise that will be fulfilled later.
   *
   * See its generic types for more details.
   */
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
}

export interface IWeb3Provider extends IProvider {
  /**
   * Returns a chain object that contains chain information and APIs.
   * @param chainId - chain type that you mean to get
   * @returns a chain object, see: {@link IChain}
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
