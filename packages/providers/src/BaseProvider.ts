import { EventEmitter } from 'events';
import {
  EventId,
  IProvider,
  DappEvents,
  RPCMethods,
  ConsoleLike,
  ResponseCode,
  BaseProviderOptions,
  IDappInteractionStream,
  IResponseInfo,
  ProviderError,
  NotificationEvents,
  RPCMethodsUnimplemented,
  RequestOption,
  Accounts,
} from '@portkey/provider-types';
import { isNotificationEvents, isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';

export interface BaseProviderState {
  accounts: null | Accounts;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
}

export default abstract class BaseProvider extends EventEmitter implements IProvider {
  private _companionStream: IDappInteractionStream;
  protected state: BaseProviderState;
  protected static _defaultState: BaseProviderState = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
  };
  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this._companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this._companionStream.on('data', this._onData.bind(this));
    this.state = BaseProvider._defaultState;
  }

  private _onData(buffer: Buffer): void {
    console.log(buffer, JSON.parse(buffer.toString()), '=====buffer');

    try {
      const { eventName, info } = JSON.parse(buffer.toString());
      if (isNotificationEvents(eventName)) {
        switch (eventName) {
          case NotificationEvents.CONNECTED:
            this.handleConnect(info);
            return;
          case NotificationEvents.DISCONNECTED:
            this.handleDisconnect(info);
            return;
          case NotificationEvents.ACCOUNTS_CHANGED:
            this.handleAccountsChanged(info);
            return;
          case NotificationEvents.NETWORK_CHANGED:
            this.handleNetworkChanged(info);
            return;
          default:
            if (eventName && info?.data) this.emit(eventName, info.data);
            break;
        }
      } else {
        if (eventName && info) this.emit(eventName, info as IResponseInfo);
      }
    } catch (error) {
      this._log.log(error, '====error');
    }
  }

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

  public request = async <T = any>(params: RequestOption): Promise<T> => {
    this._log.log(params, 'request,=======params');

    if (!params || typeof params !== 'object' || Array.isArray(params))
      throw new ProviderError('Expected a single, non-array, object argument.', ResponseCode.ERROR_IN_PARAMS);

    const eventName = this.getEventName();
    const { method, payload } = params || {};
    if (!this.methodCheck(method)) {
      throw new ProviderError('method not found!', ResponseCode.UNKNOWN_METHOD);
    }

    if (payload !== undefined && !(typeof payload !== 'object' || payload === null))
      throw new ProviderError('method not found!', ResponseCode.UNKNOWN_METHOD);

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
  };

  protected methodCheck = (method: string): method is RPCMethods => {
    return isRPCMethodsBase(method) || isRPCMethodsUnimplemented(method);
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
    const initialResponse = await this.request<{
      accounts: Accounts;
      isConnected: boolean;
      isUnlocked: boolean;
    }>({
      method: RPCMethodsUnimplemented.GET_WALLET_STATE,
    });
    if (initialResponse) {
      this.state = { ...this.state, ...initialResponse, initialized: true };
    }
    // this.handleAccountsChanged()
  };
  /**
   * When the provider becomes connected, updates internal state and emits required events.
   * @param event connected
   * @param response
   */
  protected handleConnect(response: IResponseInfo) {
    if (!this.state.isConnected) {
      this.state.isConnected = true;
      this.emit(NotificationEvents.CONNECTED, response.data);
    }
  }
  /**
   * When the provider becomes disconnected, updates internal state and emits required events
   * @param event disconnected
   * @param response
   */
  protected handleDisconnect(response: IResponseInfo) {
    if (this.state.isConnected) {
      this.state.isConnected = false;
      this.state.accounts = null;
      this.state.isUnlocked = false;
      this.emit(NotificationEvents.DISCONNECTED, response.data);
    }
  }

  /**
   * When the account is updated or the network is switched
   */
  protected handleAccountsChanged(response: IResponseInfo<Accounts>) {
    const { data } = response;
    if (!data) return;
    // TODO accounts !== this.state.accounts
    this.state.accounts = data;

    this.emit(NotificationEvents.ACCOUNTS_CHANGED, data);
  }
  /**
   * When the network switches, updates internal state and emits required events
   */
  protected handleNetworkChanged(response: IResponseInfo) {
    const { data } = response;

    // TODO accounts !== this.state.accounts
    this.state.accounts = data?.accounts;
    this.initializeState();
    this.emit(NotificationEvents.NETWORK_CHANGED, response.data);
  }
}
