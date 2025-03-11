import { PortkeyPostStream } from '@portkey/providers';
import { MobileProvider } from './MobileProvider';
import { portkeyInitEvent } from '@portkey/provider-types';

const CONTENT_SCRIPT = 'portkey-contentscript';

// Set content script post-setup function
Object.defineProperty(window, '_portkeySetupProvider', {
  value: () => {
    setupProviderStreams();
    window.dispatchEvent(
      new CustomEvent(portkeyInitEvent, {
        detail: {
          error: 0,
          message: 'FairyVault is ready.',
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
  const fairyVault = new MobileProvider({
    connectionStream: new PortkeyPostStream({
      name: CONTENT_SCRIPT,
      postWindow: window.ReactNativeWebView,
      originWindow: isApple() ? window : document,
    }),
  });
  // set fairyVault
  Object.defineProperty(window, 'FairyVault', {
    value: fairyVault,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
