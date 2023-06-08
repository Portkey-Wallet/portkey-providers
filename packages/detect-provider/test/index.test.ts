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

describe('test detect-provider', () => {
  test('nothing found when provider is not injected', async () => {
    expect(detectProvider()).rejects.toBeCalled();
  });
  test('rejects unknown provider', async () => {
    const rejects = [undefined, null, 0, 'undefined', 'null', {}];
    for (const provider of rejects) {
      globalThis.window.portkey = provider;
      if (globalThis.window.portkey) {
        const result = await detectProvider();
        expect(result).toBe(null);
      } else {
        expect(detectProvider()).rejects.toBeCalled();
      }
    }
    globalThis.window.portkey = undefined;
  });
  test('detect injected provider without timeout', async () => {
    const provider = {
      isPortkey: true,
      request: jest.fn,
    };
    setTimeout(() => {
      globalThis.window.portkey = provider;
      window.dispatchEvent(new Event(portkeyInitEvent));
    }, 1000);
    const result = await detectProvider();
    expect(result).toBe(provider);
  });
});
