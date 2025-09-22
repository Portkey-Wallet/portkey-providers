process.env.RUNTIME_ENV = 'browser';
import { vi } from 'vitest';

const mockFetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
);

global.fetch = global.fetch || mockFetch;
global.Headers = global.Headers || vi.fn();
global.Request = global.Request || vi.fn();
global.Response = global.Response || vi.fn();

import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

// Browser environment setup - polyfills for browser compatibility
global.Buffer = Buffer;
global.EventEmitter = EventEmitter;

// Additional polyfills for aelf-sdk
global.process =
  global.process ||
  ({
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    browser: true,
  } as any);

// Mock window for browser tests
if (typeof global.window === 'undefined') {
  global.window = {
    location: { origin: 'http://localhost:3000' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as any;
}
