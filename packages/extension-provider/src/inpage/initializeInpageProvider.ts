import { BaseProviderOptions, portkeyInitEvent } from '@portkey/provider-types';
import PortkeyProvider from './InpagePortkeyProvider';

export class InitializeProvider {
  constructor(props: BaseProviderOptions) {
    // Injecting an encrypted stream into the
    // web application.
    this.initPortKey(props);
  }

  initPortKey(props: BaseProviderOptions) {
    const provider = new PortkeyProvider(props);
    provider.getInitialize();
    const proxyProvider = new Proxy(provider, {
      deleteProperty: () => true,
    });
    setGlobalProvider(proxyProvider);
  }
}

/**
 * Sets the given provider instance as window.Portkey and dispatches the
 * ${portkeyInitEvent} event on window.
 */
export function setGlobalProvider(providerInstance: PortkeyProvider): void {
  console.log('dispatchEvent', portkeyInitEvent);
  (window as Record<string, any>).portkey = providerInstance;
  window.dispatchEvent(
    new CustomEvent(portkeyInitEvent, {
      detail: {
        error: 0,
        message: 'Portkey is ready.',
      },
    }),
  );
}
