import { vi } from 'vitest';

// Node environment setup - minimal polyfills needed
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
