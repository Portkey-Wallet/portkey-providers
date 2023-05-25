import { PortkeyPortStream } from '@portkey/providers';
import { MobileProvider } from './MobileProvider';

const CONTENT_SCRIPT = 'portkey-contentscript';

export const portkey = new MobileProvider({
  connectionStream: new PortkeyPortStream({ name: CONTENT_SCRIPT, portWindow: window.ReactNativeWebView }),
});
