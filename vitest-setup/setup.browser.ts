process.env.RUNTIME_ENV = 'browser';
import { vi } from 'vitest';
import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

// Browser environment setup - polyfills for browser compatibility
global.Buffer = Buffer;
global.EventEmitter = EventEmitter;

// Also set on globalThis for compatibility
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
  globalThis.EventEmitter = EventEmitter;
}

// Additional polyfills for aelf-sdk
global.process =
  global.process ||
  ({
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    browser: true,
  } as any);

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

// Mock XMLHttpRequest for aelf-sdk
class MockXMLHttpRequest {
  open = vi.fn();
  send = vi.fn();
  setRequestHeader = vi.fn();
  readyState = 4;
  status = 200;
  responseText = '{"result": "mock"}';
  onreadystatechange = null;
}

global.XMLHttpRequest = MockXMLHttpRequest as any;

// Mock window for browser tests
if (typeof global.window === 'undefined') {
  global.window = {
    location: { origin: 'http://localhost:3000' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as any;
}
