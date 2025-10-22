import { IPortkeyProvider, portkeyInitEvent, portkeyInitEventV1 } from '@portkey/provider-types';

export type TProviderName = 'Portkey' | 'portkey' | 'PortkeyWebWallet' | 'FairyVault';

export type DetectProviderOptions = { timeout?: number; providerName?: TProviderName; eventName?: string };
const CHECK_INTERVAL = 100;
/**
 * This API provides a way to detect the provider object injected to the environment.
 * @param options - determine the timeout of the detection.
 * @returns A promise that resolves to the provider object, or null if the provider is not detected.
 * @see {@link IPortkeyProvider} provider type definition
 */
export default async function detectProvider<T extends IPortkeyProvider = IPortkeyProvider>(
  options?: DetectProviderOptions,
): Promise<T | null> {
  const { timeout = 3000, providerName = 'Portkey', eventName } = options || {};

  // window.portkey already exists
  if (window[providerName]) {
    return isPortkeyProvider<T>(window[providerName]) ? window[providerName] : null;
  }

  const _portkeyEventName = isPortkeyV1(providerName) ? portkeyInitEventV1 : portkeyInitEvent;
  const _eventName = eventName ? eventName : _portkeyEventName;

  return new Promise((resolve, reject) => {
    let timeUsedCount = 0;
    let pollingId: ReturnType<typeof setTimeout> | null = null;
    const cleanUp = () => {
      if (pollingId !== null) {
        clearTimeout(pollingId);
        pollingId = null;
      }
      window.removeEventListener(_eventName, checkProvider);
    };
    const checkProvider = () => {
      if (isPortkeyProvider<T>(window[providerName])) {
        cleanUp();
        resolve(window[providerName]);
      } else if (timeUsedCount >= timeout) {
        cleanUp();
        reject(new Error(`Detect ${providerName} provider timeout, ${timeout}ms`));
      } else {
        pollingId = setTimeout(() => {
          timeUsedCount += CHECK_INTERVAL;
          checkProvider();
        }, CHECK_INTERVAL);
      }
    };
    setTimeout(checkProvider, CHECK_INTERVAL);
    window.addEventListener(_eventName, checkProvider);
  });
}

/**
 * This method is used to check if the provided object is a Portkey provider.
 * @param provider - the object that need to be checked
 * @returns provider is IPortkeyProvider
 */
export function isPortkeyProvider<T extends IPortkeyProvider = IPortkeyProvider>(provider: unknown): provider is T {
  return !!(
    provider &&
    typeof provider === 'object' &&
    'request' in provider &&
    'isPortkey' in provider &&
    provider.isPortkey
  );
}

export function isPortkeyV1(name: TProviderName) {
  return name === 'portkey';
}
