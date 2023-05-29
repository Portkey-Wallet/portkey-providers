import { BaseProviderOptions } from '@portkey/provider-types';
import { Web3Provider } from '@portkey/providers';

export default class PortKeyProvider extends Web3Provider {
  constructor(props: BaseProviderOptions) {
    super(props);
  }
  getOrigin = (): string => {
    return window.location.origin;
  };
}
