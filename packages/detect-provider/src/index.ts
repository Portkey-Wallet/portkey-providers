import { IPortkeyProvider, portkeyInitEvent, portkeyInitEventV1 } from '@portkey/provider-types';

export type TProviderName = 'Portkey' | 'portkey';

export type DetectProviderOptions = { timeout?: number; providerName?: TProviderName };

/**
 * This API provides a way to detect the provider object injected to the environment.
 * @param options - determine the timeout of the detection.
 * @returns A promise that resolves to the provider object, or null if the provider is not detected.
 * @see {@link IPortkeyProvider} provider type definition
 */
export default async function detectProvider<T extends IPortkeyProvider = IPortkeyProvider>(
  options?: DetectProviderOptions,
): Promise<T | null> {
  const { timeout = 3000, providerName = 'Portkey' } = options || {};

  // window.portkey already exists
  if (window[providerName]) return isPortkeyProvider<T>(window[providerName]) ? window[providerName] : null;

  const eventName = isPortkeyV1(providerName) ? portkeyInitEventV1 : portkeyInitEvent;

  return new Promise((resolve, reject) => {
    let timedOut = false;
    const handlePortkey = () => {
      clearTimeout(timerId);
      window.removeEventListener(eventName, handlePortkey);
      if (isPortkeyProvider<T>(window[providerName])) {
        resolve(window[providerName]);
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
    window.addEventListener(eventName, handlePortkey);
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
