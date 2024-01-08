import { EventEmitter } from 'events';
import {
  EventId,
  IInternalProvider,
  DappEvents,
  ConsoleLike,
  BaseProviderOptions,
  IDappInteractionStream,
  IResponseInfo,
  RequestOption,
  IResponseType,
  ResponseCode,
} from '@portkey/provider-types';
export abstract class BaseBridge extends EventEmitter implements IInternalProvider {
  /**
   * default console object.
   */
  protected readonly _log: ConsoleLike;
  private _companionStream: IDappInteractionStream;

  constructor({ connectionStream, logger = console, maxEventListeners = 100 }: BaseProviderOptions) {
    super();
    this._companionStream = connectionStream;
    this.setMaxListeners(maxEventListeners);
    this._log = logger;
    this._companionStream.on('data', this._onData);
    this.request = this.request.bind(this);
  }

  /**
   * This method will be registered to the window object, providing basic service based on the event name.
   * If the event name is not regarded as an event name, it will be regarded as a request eventId since they share the same way to communicate.
   * @param buffer - Raw Buffer data from the stream
   */
  protected _onData = (buffer: Buffer): void => {
    try {
      const { eventName, info } = JSON.parse(buffer?.toString()) as IResponseType;
      if (eventName && info) this.emit(eventName, info as IResponseInfo);
    } catch (error) {
      this._log.log(error, '====error');
    }
  };

  /**
   * Creates a listener on the provider
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }

  /**
   * Creates a listener on the provider, the listener will be removed after the first time it is triggered
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  public once(event: string, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    return this;
  }

  /**
   * Alias for BaseProvider.on()
   * @param event - event name that the listener will listen to
   * @param listener - callback function
   */
  public addListener(event: string, listener: (...args: any[]) => void): this {
    return this.on(event, listener);
  }

  /**
   * Remove a listener from the provider
   * @param event - event name that the listener used to listen to
   * @param listener - callback function
   */
  public removeListener(event: string, listener: (...args: any[]) => void): this {
    super.removeListener(event, listener);
    return this;
  }

  /**
   * Emit method to create a event on the provider
   * @param event - DappEvents | EventId event name or eventId
   * @param response - IResponseInfo response data
   */
  public emit(event: DappEvents | EventId, response: IResponseInfo | any): boolean {
    return super.emit(event, response);
  }
  public async request<T = any>(params: RequestOption): Promise<T> {
    if (!params || typeof params !== 'object' || Array.isArray(params))
      throw new Error('Expected a single, non-array, object argument.');

    const eventName = this.getEventName();
    const { method, payload } = params;

    if (payload !== undefined && typeof payload !== 'object' && payload !== null)
      throw new Error(`'params.payload' must be an object if provided.`);

    this._companionStream.write(
      JSON.stringify({
        method,
        payload,
        eventName,
      }),
    );
    return new Promise((resolve, reject) => {
      this.once(eventName, (response: IResponseInfo) => {
        const { code, data } = response;
        if (code == ResponseCode.SUCCESS) {
          resolve(data);
        } else {
          reject(new Error(`${response.msg}`));
        }
      });
    });
  }

  /**
   * Create an unduplicated eventId for a request
   * @param seed - used to generate random number, default is 999999
   * @returns eventId used for request() operation
   */
  protected getEventName = (seed: number = 999999): string => {
    return new Date().getTime() + '_' + Math.floor(Math.random() * seed);
  };
}
