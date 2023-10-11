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
- [Basic Type Definition](#basic-type-definition)
  - [Provider](#provider)
    - [1. isPortkey : boolean](#1-isportkey--boolean)
    - [2. isConnected()](#2-isconnected)
    - [3. on(event,callback) / once(event,callback)](#3-oneventcallback--onceeventcallback)
    - [4. removeListener(event,callback)](#4-removelistenereventcallback)
    - [5. request(params)](#5-requestparams)
    - [6. getChain(chainId)](#6-getchainchainid)
  - [DappEvents](#dappevents)
  - [IChain](#ichain)
    - [1. rpcUrl: string](#1-rpcurl-string)
    - [2. type: ChainType](#2-type-chaintype)
    - [3. chainId: ChainId](#3-chainid-chainid)
    - [4. getContract(contractAddress)](#4-getcontractcontractaddress)
  - [Error](#error)
- [Request Method \& Generic Types](#request-method--generic-types)
  - [1. method:'chainId' / method:'chainIds'](#1-methodchainid--methodchainids)
  - [2. method:'chainsInfo'](#2-methodchainsinfo)
  - [3. method:'network'](#3-methodnetwork)
  - [4. method:'requestAccounts'](#4-methodrequestaccounts)
  - [5. method:'accounts'](#5-methodaccounts)
  - [6. method:'wallet\_getWalletState'](#6-methodwallet_getwalletstate)
  - [7. method:'wallet\_getWalletName'](#7-methodwallet_getwalletname)
  - [8. {method:'sendTransaction',payload:SendTransactionParams}](#8-methodsendtransactionpayloadsendtransactionparams)
  - [9. {method:'wallet\_getSignature',payload:GetSignatureParams}](#9-methodwallet_getsignaturepayloadgetsignatureparams)
  - [10. {method:'wallet\_getCurrentManagerAddress'}](#10-methodwallet_getcurrentmanageraddress)
  - [10. {method:'wallet\_getManagerSyncStatus', payload: GetManagerSyncStatusParams}](#10-methodwallet_getmanagersyncstatus-payload-getmanagersyncstatusparams)
- [Error Code Enumeration](#error-code-enumeration)
  - [1. SUCCESS(0)](#1-success0)
  - [2. USER\_DENIED(4001)](#2-user_denied4001)
  - [3. ERROR\_IN\_PARAMS(4002)](#3-error_in_params4002)
  - [4. UNKNOWN\_METHOD(4003)](#4-unknown_method4003)
  - [5. UNIMPLEMENTED(4004)](#5-unimplemented4004)
  - [6. UNAUTHENTICATED(4005)](#6-unauthenticated4005)
  - [7. TIMEOUT(4006)](#7-timeout4006)
  - [8. CONTRACT\_ERROR(4007)](#8-contract_error4007)
  - [9. INTERNAL\_ERROR(5001)](#9-internal_error5001)

# Installation

```bash
# for npm user
npm install @portkey/detect-provider

#for yarn user
yarn add @portkey/detect-provider
```

# Basic Usage

```typescript
import detectProvider, {isPortkeyProvider} from '@portkey/detect-provider';
// ES6 Async/Await syntax
const provider:IPortkeyProvider = await detectProvider();
// ES6 Promise syntax
detectProvider().then((provider:IPortkeyProvider) => {
  // do something with provider
  provider.request({method: ... })
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

 See [Provider](#provider) section for more information.

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

# Basic Type Definition

## Provider

```typescript
interface Provider {
  isPortkey: boolean;
  isConnected(): boolean;
  on(event: DappEvents, callback: (...data: any) => void): this;
  once(event: DappEvents, callback: (...data: any) => void): this;
  removeListener(event: DappEvents, callback: (...data: any) => void): this;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
  getChain(chainId: ChainId): Promise<IChain>;
}
```

### 1. isPortkey : boolean

Determines whether the current environment is Portkey, if everything works well, it is `true`.

### 2. isConnected()

Use it to detect if current Portkey APP's wallet is connected.

```typescript
if(!provider.isConnected()){
  // Portkey APP's wallet is not connected
  alert("it seems that we have lost the APP's wallet connection");
  throw new Error('wallet disconnected...');
}
```

### 3. on(event,callback) / once(event,callback)

on(event,callback) is used to listen to the events triggered by Portkey APP.
once(event,callback) works in a similar way, but it will only be triggered once.  

```typescript
provider.on('connected',()=>{
  // Portkey APP's wallet is connected
  ...
});
provider.once('accountsChanged',(accounts)=>{
  // Portkey APP's wallet's accounts have changed
  ...
});
```

### 4. removeListener(event,callback)

Use this method to remove the listener you added before.  
If you wish your listener to be removed after it is triggered, use `once(event,callback)` will be more efficient.  
Since you need to process the function object as the parameter, you need to keep a reference to the function object.

```typescript
const listener = ()=> {
  // Portkey APP's wallet is connected
  ...
};
provider.on('connected',listener);
provider.removeListener('connected',listener);
```

### 5. request<T>(params)

See [Request Method & Generic Type](#request-method--generic-types) for more details.

```typescript
provider.request({ method: "42" }).then((result: any) => {
// Do something with the result
});
// When using typescript, you can see type definition if you call particular method name
provider.request({ method: "chainIds" }).then((result: ChainId[]) => {
    // result is ChainIds = ChainId[]
    console.log('chainIds:',result);
});
```

### 6. getChain(chainId)

This method provides a way to get the `chain` ( type of `IChain` ) object, which handles the on-chain operations.  

```typescript
provider.getChain('AELF').then((chain:IChain) => {
  // Do something with the chain object
  console.log('chainId:',chain.chainId);
});
```

See [IChain](#ichain) section for more details.

------

## DappEvents

`DappEvents` will be triggered when the corresponding event occurs.

```typescript
type DappEvents = 'connected'  | 'message' | 'disconnected' | 'accountsChanged' | 'networkChanged' | 'chainChanged' | 'error';
```

Use [provider.on(event,callback)](#3-oneventcallback--onceeventcallback) to listen to those events.  
You can see the detailed type definition in [@portkey/provider-types](../types/src/provider.ts) project .

------

## IChain

```typescript
interface IChain {
  rpcUrl: string;
  type: ChainType;
  chainId: ChainId;
  getContract(contractAddress: string): IContract;
}

interface IAElfChain extends IAElfRPCMethods, IChain {
  /** @deprecated use getContract */
  contractAt<T = any>(address: string, wallet: AElfWallet): Promise<ChainMethodResult<T>>;
}
```

### 1. rpcUrl: string

`rpcUrl` is the url of the chain's rpc server.  
You can use it to send rpc requests to the chain directly.

### 2. type: ChainType

`type` describes the type of the chain, for now it is either `'aelf'` or `'ethereum'`.  
You can use it to determine which chain the APP are using.

### 3. chainId: ChainId

if `type` is `'aelf'` , `chainId` shows which chain type the APP is on.  
For example, `'AELF'` means mainchain, `'tDVV'` means sidechain.

### 4. getContract(contractAddress)

`getContract` creates a way to get the `contract` ( type of `IContract` ) object, which handles the contract operations.

```typescript
try{
  const chain = await provider.getChain('AELF');
  const contract = chain.getContract('your-contract-address');
  // Do something with the contract object
  const result = await contract.callViewMethod('how-much-token-do-i-have', 'aelf0x12345678');
  console.log('result:', result);
}catch(e){
  console.error('getContract error:', e);
}
```

You can see detailed type definition in [source code](../types/src/chain.ts) .

## Error

```typescript
interface IProviderError extends Error {
  code: number;
  data?: unknown;
}

// Those codes may change in the future, see the source file for the latest version.
export enum ResponseCode {
  SUCCESS = 0,

  USER_DENIED = 4001,
  ERROR_IN_PARAMS = 4002,
  UNKNOWN_METHOD = 4003,
  UNIMPLEMENTED = 4004,

  UNAUTHENTICATED = 4005,
  TIMEOUT = 4006,
  CONTRACT_ERROR = 4007,
  INTERNAL_ERROR = 5001,
}
```

`IProviderError` is the error object that will be thrown when an error occurs.  

See [Error Code Enumeration](#error-code-enumeration) for more details.

# Request Method & Generic Types

```typescript
  request(params: { method: 'accounts' }): Promise<Accounts>;
  request(params: { method: 'chainId' }): Promise<ChainIds>;
  request(params: { method: 'chainIds' }): Promise<ChainIds>;
  request(params: { method: 'chainsInfo' }): Promise<ChainsInfo>;
  request(params: { method: 'requestAccounts'}): Promise<Accounts>;
  request(params: { method: 'wallet_getWalletState' }): Promise<WalletState>;
  request(params: { method: 'wallet_getWalletName' }): Promise<WalletName>;
  request(params: { method: 'network' }): Promise<NetworkType>;
  request(params: {
    method: 'sendTransaction';
    payload: SendTransactionParams;
  }): Promise<Transaction>;
  request(params: {
    method: 'wallet_getSignature',
    payload: GetSignatureParams,
  }): Promise<Signature>;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
```

You can find the complete type definition like `Accounts` in [source code](../types/src/provider.ts) .  

We recommend you to use the Async/Await syntax to call those methods.  
It helps you find out errors more effectively.

```typescript
try {
  const result = provider.request({method:'sth'});
  ...
} catch (e) {
  // when the promise is rejected, an error will be thrown
  ...
}

// you can still use the promise syntax
provider.request({method:'sth'}).then((result)=>{
  ...
}).catch((e)=>{
  ...
});

```

## 1. method:'chainId' / method:'chainIds'

  Returns the current chainId of the Portkey APP's wallet.  
  Need to know that `'chainId'` gets the current chainId, while `'chainIds'` gets all the supported chainIds.  

  ```typescript
  const chainId = await provider.request({ method: 'chainId' });
  // Although the chainId object is an array, it only contains one chainId.
  console.log('current chainId:',chainId[0]);

  const chainIds = await provider.request({ method: 'chainIds' });
  console.log('all the supported chainIds:',chainIds);
  ```

## 2. method:'chainsInfo'

  Gets all the supported chains' information.  

  ```typescript
  const chainsInfo = await provider.request({ method: 'chainsInfo' });
  console.log('all the on-chain info:', chainsInfo);
  ```

## 3. method:'network'

  Returns the current network type of the Portkey APP's wallet.  
  For now it's either `'MAIN'` or `'TESTNET'` .

  ```typescript
  const networkType = await provider.request({ method: 'network' });
  console.log('current network type is :',networkType);
  ```

## 4. method:'requestAccounts'

  Request the Portkey APP's wallet to connect to your dapp, this method is the bridge to get the permission required by the following methods below.  
  If the user has not connected to your dapp, the Portkey APP's wallet will pop up a window to ask the user to connect to your dapp.  
  If the user has connected to your dapp and hasn't remove the permission, this method returns info without a second confirmation.

  ```typescript
  try {
    const accounts = await provider.request({ method: 'requestAccounts' });
    console.log(accounts);
  }catch (e) {
    // An error will be thrown if the user denies the permission request.
    console.log('user denied the permission request');
  }
  ```

## 5. method:'accounts'

  Returns the current account addresses of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  const accounts = await provider.request({ method: 'accounts' });
  console.log(accounts);
  ```

## 6. method:'wallet_getWalletState'

  Returns the current wallet state of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  const walletState = await provider.request({ method: 'wallet_getWalletState' });
  console.log('walletState:', walletState);
  ```

## 7. method:'wallet_getWalletName'

  Returns the current wallet name of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.
  
  ```typescript
    const walletName = await provider.request({ method: 'wallet_getWalletName' });
    console.log('walletName:', walletName);
  ```

## 8. {method:'sendTransaction',payload:SendTransactionParams}
  
  Send a transaction to the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  try {
    const txId = await provider.request({
      method: 'sendTransaction',
      payload: {
        to: '0x...',
        ...
      },
    });
    if(!txId) throw new Error('transaction failed!');
    console.log('transaction success! transaction id:', txId);
   } catch (e) {
   // An error will be thrown if the user denies the permission request, or other issues.
   ...
   }
  ```

## 9. {method:'wallet_getSignature',payload:GetSignatureParams}

  Get a signature from the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  try {
    const signature = await provider.request({
      method: 'wallet_getSignature',
      payload: {
        data: '0x...',
      },
    });
    if (!signature) throw new Error('sign failed!');
    console.log('sign success! signature:', signature);
  } catch (e) {
  // An error will be thrown if the user denies the permission request, or other issues.
  ...
  }
  ```
## 10. {method:'wallet_getCurrentManagerAddress'}

  Get a signature from the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  try {
    const managerAddress = await provider.request({
      method: 'wallet_getCurrentManagerAddress',
    });
  } catch (e) {
  // An error will be thrown if the user denies the permission request, or other issues.
  ...
  }
  ```
## 10. {method:'wallet_getManagerSyncStatus', payload: GetManagerSyncStatusParams}

  Get a signature from the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  try {
    const status = await provider.request({
      method: 'wallet_getManagerSyncStatus',
      payload: {
        chainId: chainId, // AELF, tDVV, tDVW
      },
    });
    if(status){
      // manager synchronization completed
    } else {
      // manager synchronizing
    }
  } catch (e) {
  // An error will be thrown if the user denies the permission request, or other issues.
  ...
  }
  ```

# Error Code Enumeration

## 1. SUCCESS(0)

It means nothing wrong happened, and the result is exactly what you want.  

## 2. USER_DENIED(4001)

It means the user denied the permission request, when you call methods like `request({ method: 'requestAccounts' })` that needs the user's permission.  
The Wallet will show a dialog that asks the user to make a decision, if the user clicks the "cancel" button, this error will be thrown.  
It is recommended to catch this error when you call those methods(for now):  

  1. requestAccounts ;
  2. sendTransaction ;
  3. wallet_getSignature .

## 3. ERROR_IN_PARAMS(4002)

It means the parameters you passed in are invalid, you should check them again.  
If you think your params may cause this trouble, you should catch this error and handle it.  
If you are using a method that doesn't need any params, you can ignore this error.

## 4. UNKNOWN_METHOD(4003)

It means the method you called is not supported by the wallet, check it again.

## 5. UNIMPLEMENTED(4004)

You are using a method that is not implemented yet, or removed in current version because it is deprecated.
Check the Wallet's version before calling those methods.

## 6. UNAUTHENTICATED(4005)

It means the user has not connected to your dapp, you should call `request({ method: 'requestAccounts' })` first to get the permission.

## 7. TIMEOUT(4006)

The wallet can not provide your expected result in time, you should try again later.

## 8. CONTRACT_ERROR(4007)

There's some issues happened when the wallet is calling the contract, you should check your params and try again.

## 9. INTERNAL_ERROR(5001)

The wallet is facing some internal issues which results in the failure of your request, you should try again later or refresh your page.
