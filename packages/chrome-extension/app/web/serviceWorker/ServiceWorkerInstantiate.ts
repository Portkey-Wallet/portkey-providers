import { LocalStream } from 'extension-streams';
import InternalMessage from 'message/InternalMessage';
import { SendResponseFun } from 'types';
import { InternalMessageData } from 'types/SW';

// This is the script that runs in the extension's serviceWorker ( singleton )
export default class ServiceWorkerInstantiate {
  constructor() {
    this.setupInternalMessaging();
  }

  // Watches the internal messaging system ( LocalStream )
  async setupInternalMessaging() {
    try {
      LocalStream.watch(async (request: any, sendResponse: SendResponseFun) => {
        const message = InternalMessage.fromJson(request);

        await this.dispenseMessage(sendResponse, message);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Delegates message processing to methods by message type
   * @param sendResponse - Delegating response handler
   * @param message - The message to be dispensed
   */
  dispenseMessage(sendResponse: SendResponseFun, message: InternalMessageData) {
    console.log(message, 'message===');
    sendResponse({
      error: 0,
      data: 'data',
    });
  }
}
