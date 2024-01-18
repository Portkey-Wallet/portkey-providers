<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>
<h1 align="center">@portkey/mobile-provider</h1>

- [__Usage__](#usage)
  - [1. Use @portkey-v1/detect-provider](#1-use-portkeydetect-provider)
  - [2. Detect provider by your own code (not recommended)](#2-detect-provider-by-your-own-code-not-recommended)

This project creates javascript code that will be injected into Portkey APP's WebView environment, for providing basic functions for DApp developers.

# __Usage__

## 1. Use @portkey-v1/detect-provider

We recommend to use the __[@portkey-v1/detect-provider](../detect-provider/README.md)__ package to detect if Portkey is injected.  
Click the link above to learn more.  

## 2. Detect provider by your own code (not recommended)

__provider__ will be injected to the `window` or `globalThis.window` object, providing you a way to detect it directly.  
Also, when __provider__ is injected, an event named `portkeyInitEvent` will be triggered on the host object (`window`).

```typescript
const detectedProvider:IProvider = window.portkey;
if(!detectedProvider){
    // Portkey is not injected yet
    window.addEventListener('portkeyInitEvent', ()=>{
      const provider = window.portkey;
      // Do something with the provider
      ...
    });
  }
```

You can find more details and examples in __[@portkey-v1/detect-provider](../detect-provider/README.md)__ 's README doc.
