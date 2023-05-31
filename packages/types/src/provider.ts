import { DappEvents, EventId } from './event';
import { IResponseInfo, RequestOption } from './request';
import type { IDappInteractionStream } from './stream';
import { ChainId, IChain } from './chain';
import { ChainsInfo } from './response';

export interface IStreamBehaviour {
  onConnectionDisconnect: (error: Error) => void;
}

export interface IProvider extends IStreamBehaviour {
  on(event: DappEvents, listener: (...args: any[]) => void): this;
  once(event: DappEvents, listener: (...args: any[]) => void): this;
  emit(event: DappEvents | EventId, response: IResponseInfo): boolean;
  addListener(event: DappEvents, listener: (...args: any[]) => void): this;
  removeListener(event: DappEvents, listener: (...args: any[]) => void): this;

  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
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

export interface IWeb3Provider extends IProvider {
  getChain(chainId: ChainId): Promise<IChain>;
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
