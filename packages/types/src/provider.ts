import { DappEvents, EventId } from './event';
import { IResponseInfo, RequestOption } from './request';
import type { IDappInteractionStream } from './stream';
import { ChainId, IChain } from './chain';
import { Accounts, ChainIds, ChainsInfo, ConnectInfo, NetworkType, ProviderErrorType } from './response';

export interface IStreamBehaviour {
  onConnectionDisconnect: (error: Error) => void;
}

export interface IProvider extends IStreamBehaviour {
  // on
  on(event: 'connected', listener: (connectInfo: ConnectInfo) => void): this;
  on(event: 'networkChanged', listener: (networkType: NetworkType) => void): this;
  on(event: 'chainChanged', listener: (chainIds: ChainIds) => void): this;
  on(event: 'accountsChanged', listener: (accounts: Accounts) => void): this;
  on(event: 'disconnected', listener: (error: ProviderErrorType) => void): this;
  on(event: DappEvents, listener: (...args: any[]) => void): this;

  once(event: DappEvents, listener: (...args: any[]) => void): this;

  removeListener(event: 'connected', listener: (connectInfo: ConnectInfo) => void): this;
  removeListener(event: 'networkChanged', listener: (networkType: NetworkType) => void): this;
  removeListener(event: 'chainChanged', listener: (chainIds: ChainIds) => void): this;
  removeListener(event: 'accountsChanged', listener: (accounts: Accounts) => void): this;
  removeListener(event: 'disconnected', listener: (error: ProviderErrorType) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;

  // request
  request<T = ChainIdRequestResponse>(params: { method: 'chainId' }): Promise<T>;
  request<T = ChainIdRequestResponse>(params: { method: 'chainIds' }): Promise<T>;
  request<T = ChainsInfoRequestResponse>(params: { method: 'chainsInfo' }): Promise<T>;
  request<T = RequestAccountsRequestResponse>(params: { method: 'requestAccounts' }): Promise<T>;
  request<T = GetWalletStateRequestResponse>(params: { method: 'wallet_getWalletState' }): Promise<T>;
  request<T = TransactionRequestResponse>(params: {
    method: 'sendTransaction';
    payload: SendTransactionParams;
  }): Promise<T>;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
}

export interface IWeb3Provider extends IProvider {
  getChain(chainId: ChainId): Promise<IChain>;
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
  chainId: ChainId;
  contractAddress: string;
  method: string;
  params?: readonly unknown[] | object;
}

export type MethodResponse =
  | TransactionRequestResponse
  | RequestAccountsRequestResponse
  | GetWalletStateRequestResponse
  | ChainIdRequestResponse
  | ChainsInfoRequestResponse
  | null
  | undefined;

export type ChainIdRequestResponse = Array<string>;

export type ChainsInfoRequestResponse = ChainsInfo;

export interface GetWalletStateRequestResponse {
  accounts: IAccounts;
  isConnected: boolean;
  isUnlocked: boolean;
}

export interface RequestAccountsRequestResponse {
  AELF?: string[];
  tDVV?: string[];
}

export interface TransactionRequestResponse {
  transactionId: string;
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

export type Chain = string; //  Chain:ChainId
export type IAccounts = { [x: Chain]: string[] }; // {AELF: ['ELF_xxxxx_AELF'],
