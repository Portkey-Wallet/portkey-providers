import { PortkeyPostStream } from '@portkey/providers';
import { MobileProvider } from './MobileProvider';
import { portkeyInitEvent } from '@portkey/provider-types';

const CONTENT_SCRIPT = 'portkey-contentscript';

// Set content script post-setup function
Object.defineProperty(window, '_portkeySetupProvider', {
  value: () => {
    setupProviderStreams();
    document.dispatchEvent(
      new CustomEvent(portkeyInitEvent, {
        detail: {
          error: 0,
          message: 'Portkey is ready.',
        },
      }),
    );
    delete window._portkeySetupProvider;
  },
  configurable: true,
  enumerable: false,
  writable: false,
});
const isApple = () => {
  return navigator.userAgent.toLowerCase().match(/\(ip.*applewebkit(?!.*(version|crios))/);
};
function setupProviderStreams() {
  const portkey = new MobileProvider({
    connectionStream: new PortkeyPostStream({
      name: CONTENT_SCRIPT,
      postWindow: window.ReactNativeWebView,
      originWindow: isApple() ? window : document,
    }),
  });
  // set portkey
  Object.defineProperty(window, 'portkey', {
    value: portkey,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
