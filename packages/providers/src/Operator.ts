import {
  EventMessage,
  IDappInteractionStream,
  IRequestParams,
  IResponseType,
  IOperator,
} from '@portkey/provider-types';

export default abstract class Operator implements IOperator {
  /**
   * we use _stream to communicate with the dapp
   * Operator does not need to know how to communicate with the dapp
   */
  private _stream: IDappInteractionStream;

  constructor(stream: IDappInteractionStream) {
    this._stream = stream;
  }
  /**
   * use this method to handle the message from the dapp
   * @param message the message from the dapp
   */
  public handleRequestMessage = async (message: string) => {
    if (!(message?.length > 0)) {
      this._stream.createMessageEvent('invalid message');
      return;
    }
    try {
      const requestObj = JSON.parse(message) as IRequestParams;
      const result = await this.handleRequest(requestObj);
      this._stream.write(JSON.stringify(result));
    } catch (e) {
      console.error('error when parsing message:' + message, 'error:', e);
      this._stream.createMessageEvent('operation failed:' + e?.message);
    }
  };

  // Crypto Behaviour is not fully implemented yet
  // public useCryptoData = async (origin: AnyOriginMark, data: Object): Promise<string> => {
  //   const originRecord = this.origins.find(item => item.origin === origin);
  //   if (!originRecord) return JSON.stringify(data);
  //   return originRecord.useCrypto && originRecord.publicKey
  //     ? this._cryptoManager.encrypt(originRecord.publicKey, JSON.stringify(data))
  //     : JSON.stringify(data);
  // };

  // public readCryptoData = async (origin: AnyOriginMark, data: string): Promise<string> => {
  //   const originRecord = this.origins.find(item => item.origin === origin);
  //   if (!originRecord) return data;
  //   return originRecord.useCrypto && originRecord.publicKey
  //     ? this._cryptoManager.decrypt(originRecord.publicKey, data)
  //     : data;
  // };

  /**
   * implement this method to handle the request from the dapp
   * @param request the request from the dapp
   */
  public abstract handleRequest(request: IRequestParams): Promise<IResponseType>;

  /**
   * expose it to your server code, it creates an event to the dapp
   * @param event the event data you want to publish to the dapp
   */
  public publishEvent = (event: EventMessage): void => {
    this._stream.push(event);
  };
}
