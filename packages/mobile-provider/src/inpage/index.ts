import { portkey } from './portkey';

// Set content script post-setup function
Object.defineProperty(window, 'portkey', {
  value: portkey,
  configurable: true,
  enumerable: false,
  writable: false,
});
