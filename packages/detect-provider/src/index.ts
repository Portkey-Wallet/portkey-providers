import { IWeb3Provider, portkeyInitEvent } from '@portkey/provider-types';

export type DetectProviderOptions = { timeout?: number };

const detectProvider = async (options?: DetectProviderOptions): Promise<IWeb3Provider | null> => {
  const { timeout = 3000 } = options || {};
  if (window.portkey) {
    return isPortkeyProvider(window.portkey) ? window.portkey : null;
  }

  return new Promise((resolve, reject) => {
    let timedOut;
    const handlePortkey = () => {
      clearTimeout(timerId);
      window.removeEventListener(portkeyInitEvent, handlePortkey);
      if (isPortkeyProvider(window.portkey)) {
        resolve(window.portkey);
      } else {
        if (timedOut) {
          reject(new Error('Detect portkey provider timeout'));
        } else {
          resolve(null);
        }
      }
    };
    const timerId = setTimeout(() => {
      timedOut = true;
      handlePortkey();
    }, timeout);
    window.addEventListener(portkeyInitEvent, handlePortkey);
  });
};

const isPortkeyProvider = (provider: unknown): provider is IWeb3Provider => {
  return !!provider && typeof provider === 'object' && 'request' in provider;
};

export default detectProvider;
