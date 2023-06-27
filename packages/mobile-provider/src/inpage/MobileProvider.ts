import { BaseProviderOptions } from '@portkey/provider-types';
import { PortkeyProvider } from '@portkey/providers';
export class MobileProvider extends PortkeyProvider {
  constructor(options: BaseProviderOptions) {
    super(options);
    this.getInitialize();
  }
}
