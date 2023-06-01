import { Web3Provider } from '@portkey/providers';
export class MobileProvider extends Web3Provider {
  constructor(options) {
    super(options);
    this.getInitialize();
  }
}
