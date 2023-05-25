import { InitializeProvider } from '@portkey/extension-provider';
import { shouldInjectProvider } from '@portkey/provider-utils';
import { PortkeyPortStream } from '@portkey/providers';

const CONTENT_SCRIPT = 'portkey-contentscript';

export default class Inject {
  constructor() {
    this.initPortKey();
  }

  initPortKey() {
    if (shouldInjectProvider()) {
      const portkeyStream = new PortkeyPortStream({ name: CONTENT_SCRIPT, portWindow: window });
      new InitializeProvider({
        connectionStream: portkeyStream,
      });
    }
  }
}

new Inject();
