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
    setGlobalProvider(proxyProvider, {
      key: props.options?.initKey,
      message: props.options?.initMessage,
    });
  }
}

type TOptions = {
  key?: string;
  message?: string;
};
/**
 * Sets the given provider instance as window.Portkey and dispatches the
 * ${portkeyInitEvent} event on window.
 */
export function setGlobalProvider(providerInstance: PortkeyProvider, options?: TOptions): void {
  const { key, message } = options || {};
  console.log('dispatchEvent', portkeyInitEvent);
  (window as Record<string, any>)[key ? key : 'Portkey'] = providerInstance;
  window.dispatchEvent(
    new CustomEvent(portkeyInitEvent, {
      detail: {
        error: 0,
        message: message || 'Portkey is ready.',
      },
    }),
  );
}
