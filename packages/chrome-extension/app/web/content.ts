import { ContentStream } from '@portkey/extension-provider';
import { shouldInjectProvider } from '@portkey/provider-utils';

// The filename of the injected communication script.
export const INJECTION_SCRIPT_FILENAME = 'js/inject.js';
const CONTENT_SCRIPT = 'metamask-contentscript';

let pageStream;

/***
 * The content script is what gets run on the application.
 * It also injects and instance of Scatterdapp
 */
class Content {
  constructor() {
    this.injectInteractionScript();
  }

  /***
   * Injecting the interaction script into the application.
   * This injects an encrypted stream into the application which will
   * sync up with the one here.
   */
  injectInteractionScript() {
    pageStream = new ContentStream({ name: CONTENT_SCRIPT, portWindow: window });
    pageStream.on('data', (data) => {
      console.log(data, 'data===pageStream');
    });
    window.addEventListener('message', (e) => {
      // We only accept messages from ourselves
      console.log(e, '====addEventListener===');
    });
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
