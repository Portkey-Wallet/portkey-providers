import { BaseProviderOptions } from '@portkey/provider-types';
import { PortkeyProvider } from '@portkey/providers';
export class MobileProvider extends PortkeyProvider {
  constructor(props: BaseProviderOptions) {
    super(props);
    this.getInitialize();
  }
}
