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
- [Request Method \& Generic Types](#request-method--generic-types)
  - [1. method:'chainId' / method:'chainIds'](#1-methodchainid--methodchainids)
  - [2. method:'chainsInfo'](#2-methodchainsinfo)
  - [3. method:'requestAccounts'](#3-methodrequestaccounts)
  - [4. method:'accounts'](#4-methodaccounts)
  - [5. method:'wallet\_getWalletState'](#5-methodwallet_getwalletstate)
  - [6. method:'wallet\_getWalletName'](#6-methodwallet_getwalletname)
  - [7. {method:'sendTransaction',payload:SendTransactionParams}](#7-methodsendtransactionpayloadsendtransactionparams)
  - [8. {method:'wallet\_getSignature',payload: GetSignatureParams;}](#8-methodwallet_getsignaturepayload-getsignatureparams)

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
You can see the detailed type definition in [@portkey/provider-types__](../types/src/provider.ts) project .

------

## IChain

```typescript
interface IChain extends AElfChainMethods {
  rpcUrl: string;
  type: ChainType;
  chainId: ChainId;
  getContract(contractAddress: string): IContract;
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
  const contract = chain.getContract('mockContractAddress');
  // Do something with the contract object
  const result = await contract.callViewMethod('how-much-token-do-i-have', 'aelf0x12345678');
  console.log('result:', result);
}catch(e){
  console.error('getContract error:', e);
}
```

You can see detailed type definition in [source code](../types/src/chain.ts) .

# Request Method & Generic Types

```typescript
  request<T = Accounts>(params: { method: 'accounts' }): Promise<T>;
  request<T = ChainIds>(params: { method: 'chainId' }): Promise<T>;
  request<T = ChainIds>(params: { method: 'chainIds' }): Promise<T>;
  request<T = ChainsInfo>(params: { method: 'chainsInfo' }): Promise<T>;
  request<T = Accounts>(params: { method: 'requestAccounts' }): Promise<T>;
  request<T = WalletState>(params: { method: 'wallet_getWalletState' }): Promise<T>;
  request<T = WalletName>(params: { method: 'wallet_getWalletName' }): Promise<T>;
  request<T = Transaction>(params: {
    method: 'sendTransaction';
    payload: SendTransactionParams;
  }): Promise<T>;
  request<T = Signature>(params: {
    method: 'wallet_getSignature';
    payload: GetSignatureParams;
  }): Promise<T>;
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
```

You can find the complete type definition like `Accounts` in [source code](../types/src/provider.ts) .

### 1. method:'chainId' / method:'chainIds'

  Returns the current chainId of the Portkey APP's wallet.  
  Need to know that `'chainId'` gets the current chainId, while `'chainIds'` gets all the supported chainIds.  

  ```typescript
  provider.request({ method: "chainId" }).then((chainId: ChainId[]) => {
    console.log('current chainId is:',chainId);
  });
  provider.request({ method: "chainIds" }).then((chainIds: ChainId[]) => {
    console.log('current APP supports:',chainIds);
  });
  ```

### 2. method:'chainsInfo'

Gets all the supported chains' information.  

```typescript
provider.request({ method: "chainsInfo" }).then((chainsInfo: ChainsInfo) => {
  console.log('mainchain info',chainsInfo.AELF);
});
```

### 3. method:'requestAccounts'

  Request the Portkey APP's wallet to connect to your dapp, this method is the bridge to get the permission required by the following methods below.  
  If the user has not connected to your dapp, the Portkey APP's wallet will pop up a window to ask the user to connect to your dapp.  
  If the user has connected to your dapp and hasn't remove the permission, this method returns info without a second confirmation.

  ```typescript
  provider.request({ method: "requestAccounts" }).then((accounts: Accounts) => {
    // User confirmed
    console.log('your current mainchain address is:',accounts.AELF[0]);
  }).catch( e => {
    // User denied your request or other issues
  });
  ```

### 4. method:'accounts'

  Returns the current account addresses of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  provider.request({ method: "accounts" }).then((accounts: Accounts) => {
    console.log('the aelf mainchain account:',accounts.AELF);
  });
  ```

### 5. method:'wallet_getWalletState'

  Returns the current wallet state of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  provider.request({ method: "wallet_getWalletState" }).then((walletState: WalletState) => {
    console.log('the current wallet state:',walletState);
  });
  ```

### 6. method:'wallet_getWalletName'

  Returns the current wallet name of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.
  
  ```typescript
  provider.request({ method: "wallet_getWalletName" }).then((walletName: WalletName) => {
    console.log('the current wallet name:',walletName);
  });
  ```

### 7. {method:'sendTransaction',payload:SendTransactionParams}
  
  Send a transaction to the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  const txParams: SendTransactionParams = {
    ...
    // You can see the detailed type definition in @portkey/provider-types
  };
  provider.request({ method: "sendTransaction", payload: txParams }).then((transaction: Transaction) => {
    console.log('the transaction:',transaction);
    if(!transaction?.transactionId){
      console.error('transaction failed!');
    }
  }).catch( e => {
    // User denied your request or other issues
  });
  ```

### 8. {method:'wallet_getSignature',payload: GetSignatureParams;}

  Get a signature from the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.  
  
  ```typescript
  const signatureParams: GetSignatureParams = {
    ...
    // You can see the detailed type definition in @portkey/provider-types
  };
  provider.request({ method: "wallet_getSignature", payload: signatureParams }).then((signature: Signature) => {
    console.log('the signature:',signature);
  }).catch( e => {
    // User denied your request or other issues
  });
  ```
