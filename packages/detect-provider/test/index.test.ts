import { describe, expect, jest, test } from '@jest/globals';
import detectProvider from '../src/index';
import { portkeyInitEvent } from '@portkey/provider-types';

declare module MyGlobalThis {
  interface MyGlobal {
    window: {
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
        globalThis.window.portkey = provider;
        if (globalThis.window.portkey) {
          const result = await detectProvider({ timeout: testTimeOut });
          expect(result).toBe(null);
        } else {
          await expect(detectProvider({ timeout: testTimeOut })).rejects.toBeTruthy();
        }
        globalThis.window.portkey = undefined;
      }

      const provider = {
        isPortkey: true,
        request: jest.fn(),
      };

      globalThis.window.portkey = provider;
      expect(await detectProvider({ timeout: testTimeOut })).toBe(provider);
      globalThis.window.portkey = undefined;

      setTimeout(() => {
        globalThis.window.portkey = provider;
        window.dispatchEvent(new Event(portkeyInitEvent));
      }, testTimeOut / 2);
      expect(await detectProvider({ timeout: testTimeOut })).toBe(provider);
      globalThis.window.portkey = undefined;

      setTimeout(() => {
        globalThis.window.portkey = { name: 'fake' };
        window.dispatchEvent(new Event(portkeyInitEvent));
      }, testTimeOut / 2);
      await expect(detectProvider({ timeout: testTimeOut })).resolves.toBeFalsy();
      globalThis.window.portkey = undefined;
    },
    15 * 1000,
  );
});
