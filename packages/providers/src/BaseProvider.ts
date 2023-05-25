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
  CryptoRequest,
} from '@portkey/provider-types';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from './utils';
import { CryptoManager } from '@portkey/provider-utils';

export default abstract class BaseProvider extends EventEmitter implements IProvider {
  private companionStream: IDappInteractionStream;
  private keyPair: KeyPairJSON;
  private initialized = false;
  private cryptoManager = new CryptoManager(window.crypto.subtle);
  private _useCrypto: boolean;

  protected readonly _log: ConsoleLike;
  constructor({ connectionStream, logger = console, maxEventListeners = 100, useCrypto = false }: BaseProviderOptions) {
    super();
    this.companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this.companionStream.on('data', this.onData.bind(this));
    this._useCrypto = useCrypto;
    this.init();
  }

  private onData(buffer: Buffer): void {
    try {
      const { eventName, ...params } = JSON.parse(buffer.toString());
      if (eventName) this.emit(eventName, params.info as IDappRequestResponse);
    } catch (error) {
      this._log.log(error, '====error');
    }
  }

  public init = async () => {
    if (this.initialized) return;
    try {
      this.keyPair = await this.cryptoManager.generateKeyPair();
      if (!this.keyPair) throw new Error('generate key pair failed!');
      await new Promise<void>((resolve, reject) => {
        this.commandCall(SpecialEvent.SYNC, {
          publicKey: this._useCrypto ? this.keyPair.publicKey : null,
          useCrypto: this._useCrypto,
        } as SyncOriginData).then(() => {
          this._log.info('init success!');
          this.initialized = true;
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
        command,
        origin,
        raw: JSON.stringify(data),
      } as CryptoRequest);
      this.once(origin, async (res: CryptoResponse) => {
        const { raw } = res || {};
        try {
          if (raw) {
            const result = JSON.parse(await this.readCryptoData(raw)) as IDappResponseWrapper;
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

  public useCryptoData = async (data: object): Promise<string> => {
    const raw = JSON.stringify(data);
    return this._useCrypto ? await this.encrypt(raw) : raw;
  };

  public readCryptoData = async (data: string): Promise<string> => {
    return this._useCrypto ? await this.decrypt(data) : data;
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
    return this.cryptoManager.decrypt(this.keyPair.privateKey, params);
  }
  protected async encrypt(params: string) {
    return this.cryptoManager.encrypt(this.keyPair.privateKey, params);
  }

  public request = async (args: IDappRequestArguments): Promise<IDappRequestResponse> => {
    this._log.log(args, 'request,=======params');
    const eventName = this.getEventName();
    const { method, payload } = args || {};
    if (!this.methodCheck(method)) {
      throw new ProviderError('method not found!', ResponseCode.ERROR_IN_PARAMS);
    }
    this.companionStream.write(
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
  protected getEventName = (seed: number = 999999): string => {
    return new Date().getTime() + '_' + Math.floor(Math.random() * seed);
  };
}
