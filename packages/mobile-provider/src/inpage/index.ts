import { PortkeyPostStream } from '@portkey/providers';
import { MobileProvider } from './MobileProvider';

const CONTENT_SCRIPT = 'portkey-contentscript';

// Set content script post-setup function
Object.defineProperty(window, '_portkeySetupProvider', {
  value: () => {
    setupProviderStreams();
    delete window._portkeySetupProvider;
  },
  configurable: true,
  enumerable: false,
  writable: false,
});

function setupProviderStreams() {
  const portkey = new MobileProvider({
    connectionStream: new PortkeyPostStream({ name: CONTENT_SCRIPT, postWindow: window.ReactNativeWebView }),
  });
  // set portkey
  Object.defineProperty(window, 'portkey', {
    value: portkey,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
