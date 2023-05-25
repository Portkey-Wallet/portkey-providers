// The filename of the injected communication script.
export const INJECTION_SCRIPT_FILENAME = 'js/inject.js';

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
    console.log(window, 'window===');
    window.addEventListener('message', (event) => {
      console.log(event, 'message===window');
    });
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(INJECTION_SCRIPT_FILENAME);
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => {
      console.log('portKey inject.js onload!!!');
      script.remove();
    };
  }
}

new Content();
