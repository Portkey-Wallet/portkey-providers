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
  KeyPairJSON,
  CryptoResponse,
  SpecialEvent,
  IDappResponseWrapper,
  SyncOriginData,
  ProviderError,
} from '@portkey/provider-types';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';
import { CryptoManager } from '@portkey/provider-utils';

export default abstract class BaseProvider extends EventEmitter implements IProvider {
  private _companionStream: IDappInteractionStream;
  private _keyPair: KeyPairJSON;
  private _initialized = false;
  private _cryptoManager = new CryptoManager(window.crypto.subtle);

  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this._companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this._companionStream.on('data', this._onData.bind(this));
  }

  private _onData(buffer: Buffer): void {
    try {
      const { eventName, ...params } = JSON.parse(buffer.toString());
      if (eventName) this.emit(eventName, params.info as IDappRequestResponse);
    } catch (error) {
      this._log.log(error, '====error');
    }
  }

  public init = async () => {
    if (this._initialized) return;
    try {
      this._keyPair = await this._cryptoManager.generateKeyPair();
      if (!this._keyPair) throw new Error('generate key pair failed!');
      await new Promise<void>((resolve, reject) => {
        this.commandCall(SpecialEvent.SYNC, { publicKey: this._keyPair.publicKey } as SyncOriginData).then(() => {
          this._log.info('init success!');
          this._initialized = true;
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
      this._companionStream.push({
        command,
        raw: JSON.stringify(data),
      });
      this.once(origin, async (res: CryptoResponse) => {
        const { raw } = res || {};
        try {
          if (raw) {
            const result = JSON.parse(
              await this._cryptoManager.decrypt(this._keyPair.privateKey, raw),
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

  protected async decrypt(params: string) {
    return this._cryptoManager.decrypt(this._keyPair.privateKey, params);
  }
  protected async encrypt(params: string) {
    return this._cryptoManager.encrypt(this._keyPair.privateKey, params);
  }

  public request = async (args: IDappRequestArguments): Promise<IDappRequestResponse> => {
    this._log.log(args, 'request,=======params');
    const eventName = this.getEventName();
    const { method, payload } = args || {};
    if (!this.methodCheck(method)) {
      throw new ProviderError('method not found!', ResponseCode.ERROR_IN_PARAMS);
    }
    this._companionStream.write(
      JSON.stringify({
        method,
        payload,
        eventName,
      }),
    );
    return new Promise((resolve, reject) => {
      this.once(eventName, (response: IDappRequestResponse) => {
        const { code } = response || {};
        if (code == ResponseCode.SUCCESS) {
          resolve(response);
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
   * create an unduplicated eventId for a request
   * @param {number} seed used to generate random number, default is 999999
   * @returns {string} eventId
   */
  protected getEventName = (seed: number = 999999): string => {
    return new Date().getTime() + '_' + Math.floor(Math.random() * seed);
  };
}
