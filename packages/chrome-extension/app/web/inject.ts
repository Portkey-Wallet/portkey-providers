import { InitializeProvider } from '@portkey/extension-provider';
import { shouldInjectProvider } from '@portkey/provider-utils';
import { PortkeyPostStream } from '@portkey/providers';

const CONTENT_SCRIPT = 'portkey-contentscript';
export default class Inject {
  constructor() {
    this.initPortKey();
  }

  initPortKey() {
    if (shouldInjectProvider()) {
      const portkeyStream = new PortkeyPostStream({ name: CONTENT_SCRIPT, postWindow: window });
      new InitializeProvider({
        connectionStream: portkeyStream,
      });
    }
  }
}

new Inject();
