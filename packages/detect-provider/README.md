<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>

<h1 align="center">@portkey/detect-provider</h1>

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API](#api)
  - [1. detectProvider(options)](#1-detectprovideroptions)
    - [Parameters](#parameters)
    - [Returns](#returns)
  - [2. isPortkeyProvider(provider)](#2-isportkeyproviderprovider)
    - [Parameters](#parameters-1)
    - [Returns](#returns-1)

# Installation

```bash
npm install --save-dev @portkey/detect-provider
```

# Basic Usage

```typescript
import detectProvider, {isPortkeyProvider} from '@portkey/detect-provider';
// ES6 Async/Await syntax
const provider:IPortkeyProvider = await detectProvider();
// ES6 Promise syntax
detectProvider().then((provider:IPortkeyProvider) => {
    const result = provider as unknown;
    if (isPortkeyProvider(result)) {
        // Portkey is injected
    } else {
        // Portkey is not injected
    }
}).catch((error:Error) => {
  // Handle error
});
```

# API

## 1. detectProvider(options)

```typescript
function detectProvider<T extends IPortkeyProvider = IPortkeyProvider>
(options?: DetectProviderOptions): Promise<T | null>;
```

### Parameters

------

```typescript
interface DetectProviderOptions {
  timeout?: number; // default is 3000 ms
}
```

### Returns

------

`Promise<IPortkeyProvider | null>`

 See [MobileProvider](https://github.com/Portkey-Wallet/portkey-providers/blob/feature/providers/packages/mobile-provider/README.md) 's doc for more information.

------

## 2. isPortkeyProvider(provider)

```typescript
function isPortkeyProvider<T extends IPortkeyProvider = IPortkeyProvider>
(provider: unknown): provider is T 
```

### Parameters

------

```typescript
provider: unknown
```

### Returns

------

```typescript
provider is T // effect like boolean
```

See the above example for usage.
