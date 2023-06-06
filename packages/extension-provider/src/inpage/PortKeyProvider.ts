import { BaseProviderOptions } from '@portkey/provider-types';
import { PortkeyProvider } from '@portkey/providers';

export default class PortKeyProvider extends PortkeyProvider {
  constructor(props: BaseProviderOptions) {
    super(props);
  }
}
