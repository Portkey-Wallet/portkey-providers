import { describe, expect, jest, test } from '@jest/globals';
import detectProvider, { isPortkeyV1 } from '../src/index';
import { portkeyInitEvent } from '@portkey/provider-types';

declare module MyGlobalThis {
  interface MyGlobal {
    window: {
      Portkey?: any;
      portkey?: any;
    };
  }
}
declare const globalThis: MyGlobalThis.MyGlobal;

const testTimeOut = 200;

describe('test detect-provider', () => {
  // To ensure the async code works as expected, we put those tests in a single test case.
  test(
    'rejects unknown provider and detect right provider',
    async () => {
      await expect(detectProvider()).rejects.toBeTruthy();

      const rejects = [undefined, null, 0, 'undefined', 'null', {}];
      for (const provider of rejects) {
        globalThis.window.Portkey = provider;
        globalThis.window.portkey = provider;
        if (globalThis.window.Portkey) {
          const result = await detectProvider({ timeout: testTimeOut });
          const resultV1 = await detectProvider({ timeout: testTimeOut, providerName: 'portkey' });
          const resultV2 = await detectProvider({ timeout: testTimeOut, providerName: 'Portkey' });
          expect(resultV1).toBe(null);
          expect(resultV2).toBe(null);
          expect(result).toBe(null);
        } else {
          await expect(detectProvider({ timeout: testTimeOut })).rejects.toBeTruthy();
        }
        globalThis.window.Portkey = undefined;
      }

      const provider = {
        isPortkey: true,
        request: jest.fn(),
      };

      globalThis.window.Portkey = provider;
      expect(await detectProvider({ timeout: testTimeOut })).toBe(provider);
      globalThis.window.Portkey = undefined;

      setTimeout(() => {
        globalThis.window.Portkey = provider;
        window.dispatchEvent(new Event(portkeyInitEvent));
      }, testTimeOut / 2);
      expect(await detectProvider({ timeout: testTimeOut })).toBe(provider);
      globalThis.window.Portkey = undefined;

      setTimeout(() => {
        globalThis.window.Portkey = { name: 'fake' };
        window.dispatchEvent(new Event(portkeyInitEvent));
      }, testTimeOut / 2);
      await expect(detectProvider({ timeout: testTimeOut })).resolves.toBeFalsy();
      globalThis.window.Portkey = undefined;
    },
    15 * 1000,
  );

  test('is portkey v1', () => {
    const isV1 = isPortkeyV1('portkey');
    const isNotV1 = isPortkeyV1('Portkey');
    expect(isV1).toBe(true);
    expect(isNotV1).toBe(false);
  });
});
