import { PortkeyPostStream } from '@portkey/providers';
import { MobileProvider } from './MobileProvider';

const CONTENT_SCRIPT = 'portkey-contentscript';

export const portkey = new MobileProvider({
  connectionStream: new PortkeyPostStream({ name: CONTENT_SCRIPT, postWindow: window.ReactNativeWebView }),
});
