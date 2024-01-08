import { PortkeyBridge } from './PortkeyBridge';
import { PortkeyPostStream } from '@portkey/providers';

export const CONTENT_SCRIPT = 'portkey-bridge-content-script';
export const PortkeyInitBridgeEvent = 'portkeyInitBridgeEvent';

// Set content script post-setup function
Object.defineProperty(window, '_portkeySetupBridge', {
  value: () => {
    setupBridgeStreams();
    window.dispatchEvent(
      new CustomEvent(PortkeyInitBridgeEvent, {
        detail: {
          error: 0,
          message: 'Portkey is ready.',
        },
      }),
    );
    delete window._portkeySetupBridge;
  },
  configurable: true,
  enumerable: false,
  writable: false,
});

const isApple = () => {
  return navigator.userAgent.toLowerCase().match(/\(ip.*applewebkit(?!.*(version|crios))/);
};
function setupBridgeStreams() {
  const ptPortkey = new PortkeyBridge({
    connectionStream: new PortkeyPostStream({
      name: CONTENT_SCRIPT,
      postWindow: window.ReactNativeWebView,
      originWindow: isApple() ? window : document,
    }),
  });
  // set portkey
  Object.defineProperty(window, 'pt', {
    value: ptPortkey,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
