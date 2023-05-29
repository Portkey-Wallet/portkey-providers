import { BaseProviderOptions } from '@portkey/provider-types';
import PortKeyProvider from './PortKeyProvider';

export class InitializeProvider {
  constructor(props: BaseProviderOptions) {
    // Injecting an encrypted stream into the
    // web application.
    this.initPortKey(props);
  }

  initPortKey(props: BaseProviderOptions) {
    const provider = new PortKeyProvider(props);
    provider.getInitialize();
    const proxyProvider = new Proxy(provider, {
      deleteProperty: () => true,
    });
    setGlobalProvider(proxyProvider);
  }
}

/**
 * Sets the given provider instance as window.Portkey and dispatches the
 * 'Portkey#initialized' event on window.
 */
export function setGlobalProvider(providerInstance: PortKeyProvider): void {
  console.log('dispatchEvent', 'Portkey#initialized');
  (window as Record<string, any>).portkey = providerInstance;
  document.dispatchEvent(
    new CustomEvent('Portkey#initialized', {
      detail: {
        error: 0,
        message: 'Portkey is ready.',
      },
    }),
  );
}
