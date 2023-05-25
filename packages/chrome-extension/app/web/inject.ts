import { InitializeProvider, PortkeyPostStream } from '@portkey/extension-provider';
import shouldInjectProvider from 'utils/provider-injection';

export default class Inject {
  constructor() {
    this.initPortKey();
  }

  initPortKey() {
    if (shouldInjectProvider()) {
      const portkeyStream = new PortkeyPostStream();

      new InitializeProvider({
        connectionStream: portkeyStream,
      });
      console.log('initPortKey==');
    }
  }
}

new Inject();
