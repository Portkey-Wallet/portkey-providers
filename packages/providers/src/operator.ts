import { IDappInteractionStream, IRequestParams, IResponseType, IOperator } from '@portkey/provider-types';

export abstract class Operator implements IOperator {
  /**
   * we use _stream to communicate with the dapp
   * Operator does not need to know how to communicate with the dapp
   */
  private _stream: IDappInteractionStream;

  constructor(stream: IDappInteractionStream) {
    this._stream = stream;
  }
  /**
   * This method is used to handle the message from the dapp.
   * @param message - raw data string from the dapp
   */
  public handleRequestMessage = async (message: string) => {
    if (!message) {
      this._stream.createMessageEvent('invalid message');
      return;
    } else {
      try {
        const requestObj = JSON.parse(message) as IRequestParams;
        const result = await this.handleRequest(requestObj);
        this._stream.write(JSON.stringify(result));
      } catch (e) {
        console.error('error when parsing message:' + message, 'error:', e);
        this._stream.createMessageEvent('operation failed:' + e);
      }
    }
  };

  /**
   * Implement this method to handle the request from the dapp.
   * @param request - the request from the dapp
   */
  public abstract handleRequest(request: IRequestParams): Promise<IResponseType>;

  /**
   * Expose it to your service code, it creates an event to the dapp.
   * @param event - the event data you want to publish to the dapp
   */
  public publishEvent = (event: IResponseType): void => {
    this._stream.write(JSON.stringify(event));
  };
}
