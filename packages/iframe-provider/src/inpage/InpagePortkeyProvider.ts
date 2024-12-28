import { BaseProviderOptions } from '@portkey/provider-types';
import { PortkeyProvider } from '@portkey/providers';

export default class InpagePortkeyProvider extends PortkeyProvider {
  constructor(props: BaseProviderOptions) {
    super(props);
  }
}
