import BaseProvider from './baseProvider';
import { BaseProviderOptions } from '@portkey/provider-types';
import { Web3Provider } from './web3Provider';

export class PortkeyProvider extends Web3Provider {
  public readonly isPortkey: true;
  constructor(props: BaseProviderOptions) {
    super(props);
    this.isPortkey = true;
  }
  /**
   * **MUST** be called after instantiation to complete initialization.
   *
   * Calls `getProviderState` and passes the result to
   * {@link BaseProvider._initializeState}. Logs an error if getting initial state
   * fails. Throws if called after initialization has completed.
   */
  getInitialize() {
    return this.initializeState();
  }

  isConnected() {
    return this.state.isConnected;
  }
}
