process.env.RUNTIME_ENV = 'browser';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
);

global.fetch = global.fetch || mockFetch;
global.Headers = global.Headers || jest.fn();
global.Request = global.Request || jest.fn();
global.Response = global.Response || jest.fn();
