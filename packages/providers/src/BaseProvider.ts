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
  IDappRequestArguments,
  IDappRequestResponse,
  IDappRequestWrapper,
  PageMetaData,
  KeyPairJSON,
  RPCMethodsBase,
  ExchangeKeyRequestData,
} from '@portkey/provider-types';
import { getHostName } from './utils';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';
import { CryptoManager, generateOriginName } from '@portkey/provider-types';

export default abstract class BaseProvider extends EventEmitter implements IProvider {
  private companionStream: IDappInteractionStream;
  private _keyPair: KeyPairJSON;

  //this.keyPair should not be read from outside
  public get keyPair(): KeyPairJSON {
    return undefined as any;
  }

  public set keyPair(keyPair: KeyPairJSON) {
    this._keyPair = keyPair;
  }

  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this.companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this.init();
  }

  public init = async () => {
    this.keyPair = await CryptoManager.generateKeyPair();
    const res = await this.request({
      method: RPCMethodsBase.EXCHANGE_KEY,
      payload: { publicKey: this._keyPair.publicKey, mark: generateOriginName() } as ExchangeKeyRequestData,
    });
    setTimeout(() => {
      throw new Error('init timeout');
    }, 3000);
    if (res.code !== ResponseCode.SUCCESS) {
      throw new Error('init failed!');
    }
    this._log.info('init success!');
  };

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
  public emit(event: DappEvents | EventId, response: IDappRequestResponse | EventResponse): boolean {
    return super.emit(event, response);
  }

  public request = async (params: IDappRequestArguments): Promise<IDappRequestResponse> => {
    const eventId = this.getEventId();
    const { method } = params || {};
    this._log.log(params, 'request,=======params');
    if (!this.methodCheck(method)) {
      return { code: ResponseCode.ERROR_IN_PARAMS, msg: 'method not found!' };
    }
    this.companionStream.push({
      eventId,
      params: Object.assign({}, params, { metaData: this.getMetaData() } as Partial<IDappRequestArguments>),
    } as IDappRequestWrapper);
    return new Promise((resolve, reject) => {
      this.once(eventId, (response: IDappRequestResponse) => {
        if (response.code === ResponseCode.SUCCESS) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });
  };

  private getMetaData = (): PageMetaData => {
    return {
      hostname: getHostName(window.location.href),
    };
  };

  protected methodCheck = (method: string): method is RPCMethods => {
    return isRPCMethodsBase(method) || isRPCMethodsUnimplemented(method);
  };

  setupStream = (companionStream: IDappInteractionStream) => {
    this.companionStream = companionStream;
  };

  onConnectionDisconnect = (error: Error) => {
    console.warn('connection disconnected, please re-open this webpage!', error);
  };

  /**
   * create an unduplicated eventId for a request
   * @param {number} seed used to generate random number, default is 999999
   * @returns {string} eventId
   */
  protected getEventId = (seed: number = 999999): string => {
    return new Date().getTime() + '_' + Math.floor(Math.random() * seed);
  };
}
