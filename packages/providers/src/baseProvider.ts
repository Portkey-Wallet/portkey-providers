import { EventEmitter } from 'events';
import {
  EventId,
  IInternalProvider,
  DappEvents,
  MethodsType,
  ConsoleLike,
  ResponseCode,
  BaseProviderOptions,
  IDappInteractionStream,
  IResponseInfo,
  ProviderError,
  NotificationEvents,
  MethodsUnimplemented,
  RequestOption,
  Accounts,
  SendTransactionParams,
  MethodsBase,
  WalletState,
  Transaction,
  ChainIds,
  ChainsInfo,
  ConnectInfo,
  ProviderErrorType,
} from '@portkey/provider-types';
import { isNotificationEvents, isMethodsBase, isMethodsUnimplemented } from './utils';
import isEqual from 'lodash/isEqual';

export interface BaseProviderState {
  accounts: null | Accounts;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  chainIds: ChainIds | null;
  networkType: string | null;
}

export default abstract class BaseProvider extends EventEmitter implements IInternalProvider {
  private _companionStream: IDappInteractionStream;
  protected state: BaseProviderState;
  protected static _defaultState: BaseProviderState = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    chainIds: null,
    networkType: null,
  };
  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this._companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this._companionStream.on('data', this._onData);
    this.state = BaseProvider._defaultState;
    this.request = this.request.bind(this);
  }

  protected _onData = (buffer: Buffer): void => {
    try {
      const { eventName, info } = JSON.parse(buffer?.toString());
      if (isNotificationEvents(eventName) && info) {
        switch (eventName) {
          case NotificationEvents.CONNECTED:
            this.handleConnect(info.data);
            return;
          case NotificationEvents.DISCONNECTED:
            this.handleDisconnect(info.data);
            return;
          case NotificationEvents.MESSAGE:
            this.handleMessage(info.data);
            return;
          case NotificationEvents.ACCOUNTS_CHANGED:
            this.handleAccountsChanged(info.data);
            return;
          case NotificationEvents.NETWORK_CHANGED:
            this.handleNetworkChanged(info.data);
            return;
          case NotificationEvents.CHAIN_CHANGED:
            this.handleChainChanged(info.data);
            return;
          default:
            if (eventName) this.emit(eventName, info.data);
            break;
        }
      } else {
        if (eventName && info) this.emit(eventName, info as IResponseInfo);
      }
    } catch (error) {
      this._log.log(error, '====error');
    }
  };

  /**
   * @override
   * creates a listener on the provider
   * @param {string} event event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }

  /**
   * @override
   * creates a listener on the provider, the listener will be removed after the first time it is triggered
   * @param {string} event event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public once(event: string, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    return this;
  }

  /**
   * @override
   * alias for ```BaseProvider.on()```
   * @param {string} event event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public addListener(event: string, listener: (...args: any[]) => void): this {
    return this.on(event, listener);
  }

  /**
   * remove a listener from the provider
   * @param {string} event event name that the listener used to listen to
   * @param {Function} listener callback function
   */
  public removeListener(event: string, listener: (...args: any[]) => void): this {
    super.removeListener(event, listener);
    return this;
  }

  /**
   * emit method to create a event on the provider
   * @param event ```DappEvents | EventId``` event name or eventId
   * @param response ```IResponseInfo``` response data
   */
  public emit(event: DappEvents | EventId, response: IResponseInfo | any): boolean {
    return super.emit(event, response);
  }

  public async request<T = Accounts>(params: { method: typeof MethodsBase.ACCOUNTS }): Promise<T>;
  public async request<T = ChainIds>(params: { method: typeof MethodsBase.CHAIN_ID }): Promise<T>;
  public async request<T = ChainIds>(params: { method: typeof MethodsBase.CHAIN_IDS }): Promise<T>;
  public async request<T = ChainsInfo>(params: { method: typeof MethodsBase.CHAINS_INFO }): Promise<T>;
  public async request<T = Accounts>(params: { method: typeof MethodsBase.REQUEST_ACCOUNTS }): Promise<T>;
  public async request<T = WalletState>(params: { method: typeof MethodsUnimplemented.GET_WALLET_STATE }): Promise<T>;
  public async request<T = Transaction>(params: {
    method: typeof MethodsBase.SEND_TRANSACTION;
    payload: SendTransactionParams;
  }): Promise<T>;
  public async request<T = any>(params: RequestOption): Promise<T> {
    this._log.log(params, 'request,=======params');

    if (!params || typeof params !== 'object' || Array.isArray(params))
      throw new ProviderError('Expected a single, non-array, object argument.', ResponseCode.ERROR_IN_PARAMS);

    const eventName = this.getEventName();
    const { method, payload } = params || {};
    // if (!this.methodCheck(method)) {
    //   throw new ProviderError(ResponseMessagePreset['UNKNOWN_METHOD'], ResponseCode.UNKNOWN_METHOD);
    // }

    if (payload !== undefined && typeof payload !== 'object' && payload !== null)
      throw new ProviderError(`'params.payload' must be an object if provided.`, ResponseCode.UNKNOWN_METHOD);

    this._companionStream.write(
      JSON.stringify({
        method,
        payload,
        eventName,
      }),
    );
    return new Promise((resolve, reject) => {
      this.once(eventName, (response: IResponseInfo) => {
        const { code, data } = response || {};
        if (code == ResponseCode.SUCCESS) {
          resolve(data);
        } else {
          reject(new ProviderError(`${response.msg}`, code));
        }
      });
    });
  }

  protected methodCheck = (method: string): method is MethodsType => {
    return isMethodsBase(method) || isMethodsUnimplemented(method);
  };

  onConnectionDisconnect = (error: Error) => {
    console.warn('connection disconnected, please re-open this webpage!', error);
  };

  /**
   * create an unduplicated eventId for a request
   * @param {number} seed used to generate random number, default is 999999
   * @returns {string} eventId
   */
  protected getEventName = (seed: number = 999999): string => {
    return new Date().getTime() + '_' + Math.floor(Math.random() * seed);
  };

  protected initializeState = async () => {
    if (this.state.initialized === true) {
      throw new ProviderError('Provider already initialized.', ResponseCode.INTERNAL_ERROR);
    }
    const initialResponse = await this.request({
      method: MethodsUnimplemented.GET_WALLET_STATE,
    });
    if (initialResponse) {
      this.state = { ...this.state, ...initialResponse, initialized: true };
    }
    initialResponse.accounts && this.handleAccountsChanged(initialResponse.accounts);
    initialResponse.chainIds && this.handleChainChanged(initialResponse.chainIds);
    initialResponse.networkType && this.handleNetworkChanged(initialResponse.networkType);
  };
  /**
   * When the provider becomes connected, updates internal state and emits required events.
   * @param event connected
   * @param response
   */
  protected handleConnect(response: ConnectInfo) {
    if (!this.state.isConnected) {
      this.state.isConnected = true;
      this.emit(NotificationEvents.CONNECTED, response);
    }
  }
  /**
   * When the provider becomes disconnected, updates internal state and emits required events
   * @param event disconnected
   * @param response
   */
  protected handleDisconnect(response: IResponseInfo<ProviderErrorType>) {
    if (this.state.isConnected) {
      this.state.isConnected = false;
      this.state.accounts = null;
      this.state.isUnlocked = false;
      this.state.chainIds = null;
      this.state.networkType = null;
      this.emit(NotificationEvents.DISCONNECTED, response.data);
    }
  }

  /**
   * When the account is updated or the network is switched
   */
  protected handleAccountsChanged(response: Accounts) {
    if (!response) return;

    if (isEqual(this.state.accounts, response)) return;
    this.state.accounts = response;

    this.emit(NotificationEvents.ACCOUNTS_CHANGED, response);
  }
  /**
   * When the network switches, updates internal state and emits required events
   */
  protected handleNetworkChanged(response: string) {
    if (!response) return;
    if (isEqual(this.state.networkType, response)) return;
    this.state.networkType = response;

    this.initializeState();
    this.emit(NotificationEvents.NETWORK_CHANGED, response);
  }

  /**
   * When something unexpected happens, the dapp will receive a notification
   */
  protected handleMessage(response: any) {
    this.emit(NotificationEvents.MESSAGE, response?.data ?? response?.msg);
  }

  protected handleChainChanged(response: ChainIds) {
    if (!response) return;

    if (isEqual(this.state.chainIds, response)) return;
    this.state.chainIds = response;

    this.emit(NotificationEvents.CHAIN_CHANGED, response);
  }
}
