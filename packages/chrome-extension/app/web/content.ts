import { ContentPostStream } from '@portkey/extension-provider';
import { shouldInjectProvider } from '@portkey/provider-utils';

// The filename of the injected communication script.
const INJECTION_SCRIPT_FILENAME = 'js/inject.js';
const CONTENT_SCRIPT = 'portkey-contentscript';

let pageStream: ContentPostStream;

/***
 * The content script is what gets run on the application.
 * It also injects and instance of Scatterdapp
 */
class Content {
  constructor() {
    this.injectInteractionScript();
    this.setupPageStream();
  }
  /**
   * Establish communication between pages
   */
  setupPageStream() {
    pageStream = new ContentPostStream({ name: CONTENT_SCRIPT, postWindow: window });
    pageStream.on('data', (data: Buffer) => {
      const params = JSON.parse(data.toString());
      console.log(params, location.origin, 'params===setupPageStream');

      pageStream.send({
        eventName: params.eventName,
        target: 'inpage-script',
        info: { code: 0, data: { transactionId: 'transactionId' }, msg: 'send back' },
      });
    });
  }

  /***
   * Injecting the interaction script into the application.
   * This injects an encrypted stream into the application which will
   * sync up with the one here.
   */
  injectInteractionScript() {
    // window.postMessage({ type: 'portkey', text: 'Hello from the webpage!' }, '*');
    if (shouldInjectProvider()) {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(INJECTION_SCRIPT_FILENAME);
      (document.head || document.documentElement).appendChild(script);
      script.onload = () => {
        console.log('portKey inject.js onload!!!');
        script.remove();
      };
    }
  }
}

new Content();
