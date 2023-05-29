import { EventEmitter } from 'events';
import {
  EventId,
  IProvider,
  DappEvents,
  RPCMethods,
  ConsoleLike,
  ResponseCode,
  EventResponse,
  BaseProviderOptions,
  IDappInteractionStream,
  IResponseInfo,
  ProviderError,
  NotificationEvents,
  RPCMethodsUnimplemented,
  RequestOption,
  IRequestParams,
} from '@portkey/provider-types';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';

type Chain = string; //  Chain:ChainId
type IAccounts = { [x: Chain]: string[] }; // {AELF: ['ELF_xxxxx_AELF'],

export interface BaseProviderState {
  accounts: null | IAccounts;
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
    try {
      const { eventName, ...params } = JSON.parse(buffer.toString());
      switch (eventName) {
        case NotificationEvents.CONNECTED:
          this.handleConnect(params.info);
          return;
        case NotificationEvents.DISCONNECTED:
          this.handleDisconnect(params.info);
          return;
        case NotificationEvents.ACCOUNTS_CHANGED:
          this.handleAccountsChanged(params.info);
          return;
        case NotificationEvents.NETWORK_CHANGED:
          this.handleNetworkChanged(params.info);
          return;
        default:
          if (eventName) this.emit(eventName, params.info as IRequestParams | EventResponse);
          break;
      }
    } catch (error) {
      this._log.log(error, '====error');
    }
  }

  /**
   * @override
   * creates a listener on the provider
   * @param {DappEvents} eventName event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public on(event: DappEvents, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }

  /**
   * @override
   * creates a listener on the provider, the listener will be removed after the first time it is triggered
   * @param {DappEvents} eventName event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public once(event: DappEvents | EventId, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    return this;
  }

  /**
   * @override
   * alias for ```BaseProvider.on()```
   * @param {DappEvents} eventName event name that the listener will listen to
   * @param {Function} listener callback function
   */
  public addListener(eventName: DappEvents, listener: (...args: any[]) => void): this {
    return this.on(eventName, listener);
  }

  /**
   * remove a listener from the provider
   * @param eventName  event name that the listener used to listen to
   * @param {Function} listener callback function
   */
  public removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    super.removeListener(eventName, listener);
    return this;
  }

  /**
   * emit method to create a event on the provider
   * @param event ```DappEvents | EventId``` event name or eventId
   * @param response ```IDappRequestResponse | EventResponse``` response data
   */
  public emit(event: DappEvents | EventId, response: IResponseInfo | EventResponse): boolean {
    return super.emit(event, response);
  }

  public request = async <T = any>(params: RequestOption): Promise<T> => {
    this._log.log(params, 'request,=======params');
    const eventName = this.getEventName();
    const { method, payload } = params || {};
    if (!this.methodCheck(method)) {
      throw new ProviderError('method not found!', ResponseCode.ERROR_IN_PARAMS);
    }
    this._companionStream.write(
      JSON.stringify({
        method,
        payload,
        eventName,
        origin: this.getOrigin(),
      } as IRequestParams),
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

  setupStream = (_companionStream: IDappInteractionStream) => {
    this._companionStream = _companionStream;
  };

  onConnectionDisconnect = (error: Error) => {
    console.warn('connection disconnected, please re-open this webpage!', error);
  };

  /**
   * it is used to get the origin of the current page
   * usually it can be the window.location.origin
   */
  protected abstract getOrigin: () => string;

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
      accounts: IAccounts;
      isConnected: boolean;
      isUnlocked: boolean;
    }>({
      method: RPCMethodsUnimplemented.GET_PROVIDER_STATE,
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
  protected handleConnect(response: EventResponse) {
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
  protected handleDisconnect(response: EventResponse) {
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
  protected handleAccountsChanged(response: EventResponse) {
    const { data } = response;

    // TODO accounts !== this.state.accounts
    this.state.accounts = data?.accounts;

    this.emit(NotificationEvents.ACCOUNTS_CHANGED, response.data);
  }
  /**
   * When the network switches, updates internal state and emits required events
   */
  protected handleNetworkChanged(response: EventResponse) {
    const { data } = response;

    // TODO accounts !== this.state.accounts
    this.state.accounts = data?.accounts;
    this.initializeState();
    this.emit(NotificationEvents.NETWORK_CHANGED, response);
  }
}
