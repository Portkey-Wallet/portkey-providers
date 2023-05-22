import { IWeb3Provider, portkeyInitEvent } from '@portkey/provider-types';

const detectProvider = async (): Promise<IWeb3Provider | null> => {
  const timeout = 3000;
  if (window.portkey) {
    return isPortkeyProvider(window.portkey) ? window.portkey : null;
  }
  return new Promise((resolve, reject) => {
    setTimeout(reject, timeout);
    window.addEventListener(portkeyInitEvent, () => {
      resolve(window.portkey as IWeb3Provider);
    });
  });
};

const isPortkeyProvider = (provider: unknown): provider is IWeb3Provider => {
  return !!provider && typeof provider === 'object' && 'request' in provider;
};

export default detectProvider;
