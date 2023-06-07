import { IPortkeyProvider, portkeyInitEvent } from '@portkey/provider-types';

export type DetectProviderOptions = { timeout?: number };

/**
 * Returns a Promise that resolves to the value of window.portkey if it is
 * An error will be thrown if timeout.
 * are provided.
 *
 * @param options - Options bag.
 * @param options.timeout - Milliseconds to wait for 'portkeyInitEvent' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * and judge whether it is a portkey provider, otherwise null.
 */
export default async function detectProvider<T extends IPortkeyProvider = IPortkeyProvider>(
  options?: DetectProviderOptions,
): Promise<T | null> {
  const { timeout = 3000 } = options || {};

  // window.portkey already exists
  if (window.portkey) return isPortkeyProvider<T>(window.portkey) ? window.portkey : null;

  return new Promise((resolve, reject) => {
    let timedOut;
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

export function isPortkeyProvider<T extends IPortkeyProvider = IPortkeyProvider>(provider: unknown): provider is T {
  return !!(
    provider &&
    typeof provider === 'object' &&
    'request' in provider &&
    'isPortkey' in provider &&
    provider.isPortkey
  );
}
