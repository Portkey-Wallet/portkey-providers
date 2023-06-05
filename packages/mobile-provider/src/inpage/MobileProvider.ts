import { PortkeyProvider } from '@portkey/providers';
export class MobileProvider extends PortkeyProvider {
  constructor(options) {
    super(options);
    this.getInitialize();
  }
}
