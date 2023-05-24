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
  CryptoResponse,
  SpecialEvent,
  MessageType,
  IDappResponseWrapper,
  CryptoRequest,
  SyncOriginData,
} from '@portkey/provider-types';
import { getHostName } from './utils';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';
import { CryptoManager, generateOriginMark } from '@portkey/provider-utils';

export default abstract class BaseProvider extends EventEmitter implements IProvider {
  private companionStream: IDappInteractionStream;
  private keyPair: KeyPairJSON;
  private readonly originMark: string = generateOriginMark();
  private inited = false;

  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this.companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this.init();
  }

  public init = async () => {
    try {
      this.keyPair = await CryptoManager.generateKeyPair();
      if (!this.keyPair) throw new Error('generate key pair failed!');
      await new Promise<void>((resolve, reject) => {
        this.commandCall(SpecialEvent.SYNC, { publicKey: this.keyPair.publicKey } as SyncOriginData).then(() => {
          this._log.info('init success!');
          this.inited = true;
          resolve();
        });
        setTimeout(() => {
          reject('init timeout!');
        }, 3000);
      });
    } catch (e) {
      this._log.error('init failed, error:' + JSON.stringify(e ?? {}));
      throw e;
    }
  };

  public commandCall = async (command: SpecialEvent, data: any): Promise<IDappResponseWrapper> => {
    return new Promise((resolve, reject) => {
      this.companionStream.push({
        type: MessageType.REQUEST,
        origin: this.originMark,
        command,
        raw: JSON.stringify(data),
      });
      this.once(origin, async (res: CryptoResponse) => {
        const { raw } = res || {};
        try {
          if (raw) {
            const result = JSON.parse(
              await CryptoManager.decrypt(this.keyPair.privateKey, raw),
            ) as IDappResponseWrapper;
            if (result.params.code === ResponseCode.SUCCESS) {
              resolve(result);
            } else {
              reject(`commandCall failed, code:${result.params.code}, message:${result.params.msg}`);
            }
          } else {
            reject('commandCall failed, no data found');
          }
        } catch (e) {
          this._log.error('commandCall failed, error:' + JSON.stringify(e ?? {}));
          reject(e);
        }
      });
      setTimeout(() => {
        reject('commandCall timeout!');
      }, 3000);
    });
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
    if (!this.inited) {
      await this.init();
    }
    const eventId = this.getEventId();
    const { method } = params || {};
    this._log.log(params, 'request,=======params');
    if (!this.methodCheck(method)) {
      return { code: ResponseCode.ERROR_IN_PARAMS, msg: 'method not found!' };
    }
    this.companionStream.push({
      origin: this.originMark,
      type: MessageType.REQUEST,
      raw: await CryptoManager.encrypt(
        this.keyPair.publicKey,
        JSON.stringify({
          eventId,
          params: Object.assign({}, params, {
            metaData: this.getMetaData(),
            mark: this.originMark,
          } as Partial<IDappRequestArguments>),
        } as IDappRequestWrapper),
      ),
    } as CryptoRequest);
    return new Promise((resolve, reject) => {
      this.once(eventId, async (response: CryptoResponse) => {
        const { type } = response || {};
        if (type === MessageType.EVENT) {
          reject('expect:request response, got: event response, please check again');
          return;
        } else {
          try {
            const data = JSON.parse(
              await CryptoManager.decrypt(this.keyPair.privateKey, response.raw),
            ) as IDappResponseWrapper;
            const { params, eventId: actualEventId } = data || {};
            if (eventId !== actualEventId) {
              reject(`expect eventId:${eventId}, got eventId:${actualEventId}`);
              return;
            } else {
              resolve(params);
            }
          } catch (e) {
            reject(`request failed, error:${e}`);
          }
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
