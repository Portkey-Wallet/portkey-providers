import { describe, test, expect, jest } from '@jest/globals';
import { PortkeyProvider } from '../src/portkeyProvider';
import { PortkeyPostStream } from '../src/portkeyPostStream';

describe('PortkeyProvider test', () => {
  let portkeyProvider: PortkeyProvider;
  test('system check well', () => {
    portkeyProvider = new PortkeyProvider({
      connectionStream: new PortkeyPostStream({
        name: 'test stream',
        postWindow: { postMessage: jest.fn() },
        originWindow: { addEventListener: jest.fn() },
      }),
    });
    expect(portkeyProvider).toBeTruthy();
    expect(() => portkeyProvider.getInitialize()).not.toThrow();
    expect(portkeyProvider.isConnected()).not.toBeUndefined();
  });
});

describe('PortkeyProvider test', () => {});
