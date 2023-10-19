import { IPortkeyProvider, portkeyInitEvent } from '@portkey/provider-types';

export type DetectProviderOptions = { timeout?: number };

/**
 * This API provides a way to detect the provider object injected to the environment.
 * @param options - determine the timeout of the detection.
 * @returns A promise that resolves to the provider object, or null if the provider is not detected.
 * @see {@link IPortkeyProvider} provider type definition
 */
export default async function detectProvider<T extends IPortkeyProvider = IPortkeyProvider>(
  options?: DetectProviderOptions,
): Promise<T | null> {
  const { timeout = 3000 } = options || {};

  // window.portkey already exists
  if (window.portkey) return isPortkeyProvider<T>(window.portkey) ? window.portkey : null;

  return new Promise((resolve, reject) => {
    let timedOut = false;
    const handlePortkey = () => {
      clearTimeout(timerId);
      window.removeEventListener(portkeyInitEvent, handlePortkey);
      if (isPortkeyProvider<T>(window.portkey)) {
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
