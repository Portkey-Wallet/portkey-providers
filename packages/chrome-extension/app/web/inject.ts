import { InitializeProvider, InpagePostStream } from '@portkey/extension-provider';
import { shouldInjectProvider } from '@portkey/provider-utils';

const CONTENT_SCRIPT = 'portkey-contentscript';
export default class Inject {
  constructor() {
    this.initPortKey();
  }

  initPortKey() {
    if (shouldInjectProvider()) {
      const portkeyStream = new InpagePostStream({ name: CONTENT_SCRIPT });
      new InitializeProvider({
        connectionStream: portkeyStream,
      });
    }
  }
}

new Inject();
