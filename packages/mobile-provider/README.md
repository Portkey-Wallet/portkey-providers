<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>
<h1 align="center">@portkey/mobile-provider</h1>

- [__Usage__](#usage)
  - [1. Use __@portkey/detect-provider__](#1-use-portkeydetect-provider)
  - [2. Detect __mobile-provider__ by your own code](#2-detect-mobile-provider-by-your-own-code)
- [__Basic Type Definition__](#basic-type-definition)
  - [__MobileProvider__](#mobileprovider)
    - [__1. `isPortkey : boolean`__](#1-isportkey--boolean)
    - [__2. `isConnected()`__](#2-isconnected)
    - [__3. `on(event,callback)` / `once(event,callback)`__](#3-oneventcallback--onceeventcallback)
    - [__`4. removeListener(event,callback)`__](#4-removelistenereventcallback)
    - [__5. `request<T>(params)`__](#5-requesttparams)
    - [__6. `getChain(chainId)`__](#6-getchainchainid)
  - [__DappEvents__](#dappevents)
  - [__IChain__](#ichain)
    - [__1. `rpcUrl : string`__](#1-rpcurl--string)
    - [__2. `type : ChainType`__](#2-type--chaintype)
    - [__3. `chainId : ChainId`__](#3-chainid--chainid)
    - [__4. `getContract(contractAddress)`__](#4-getcontractcontractaddress)
- [__Request Method \& Generic Types__](#request-method--generic-types)
  - [__1. `method:'chainId'` / `method:'chainIds'`__](#1-methodchainid--methodchainids)
  - [__2. `method:'chainsInfo'`__](#2-methodchainsinfo)
  - [__3. `method:'requestAccounts'`__](#3-methodrequestaccounts)
  - [__4. `method:'accounts'`__](#4-methodaccounts)
  - [__5. `method:'wallet_getWalletState'`__](#5-methodwallet_getwalletstate)
  - [__6. `method:'wallet_getWalletName'`__](#6-methodwallet_getwalletname)
  - [__7. `{method:'sendTransaction',payload:SendTransactionParams}`__](#7-methodsendtransactionpayloadsendtransactionparams)

# __Usage__

## 1. Use __@portkey/detect-provider__

We recommend to use the __[@portkey/detect-provider](https://github.com/Portkey-Wallet/portkey-providers)__ package to detect if Portkey is injected.  
Click the link above to learn more.  

## 2. Detect __mobile-provider__ by your own code

__mobile-provider__ will be injected to the `window` or `globalThis.window` object, providing you a way to detect it directly.  
Also, when __mobile-provider__ is injected, an event named `portkeyInitEvent` will be triggered on the host object (`window`).

```typescript
const detectedProvider:MobileProvider = window.portkey;
if(!detectedProvider){
    // Portkey is not injected yet
    window.addEventListener('portkeyInitEvent', ()=>{
      const provider = window.portkey;
      // Do something with the provider
      ...
    });
  }
```

# __Basic Type Definition__

## __MobileProvider__

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

### __1. `isPortkey : boolean`__

Determines whether the current environment is Portkey, if everything works well, it is `true`.

### __2. `isConnected()`__

Use it to detect if current Portkey APP's wallet is connected.

```typescript
if(!provider.isConnected()){
  // Portkey APP's wallet is not connected
  alert("it seems that we have lost the APP's wallet connection");
  throw new Error('wallet disconnected...');
}
```

### __3. `on(event,callback)` / `once(event,callback)`__

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

### __`4. removeListener(event,callback)`__

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

### __5. `request<T>(params)`__

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

### __6. `getChain(chainId)`__

This method provides a way to get the `chain` ( type of `IChain` ) object, which handles the on-chain operations.  

```typescript
provider.getChain('AELF').then((chain:IChain) => {
  // Do something with the chain object
  console.log('chainId:',chain.chainId);
});
```

See [IChain](#ichain) section for more details.

------

## __DappEvents__

`DappEvents` will be triggered when the corresponding event occurs.

```typescript
type DappEvents = 'connected'  | 'message' | 'disconnected' | 'accountsChanged' | 'networkChanged' | 'chainChanged' | 'error';
```

Use [provider.on(event,callback)](#3-oneventcallback--onceeventcallback) to listen to those events.  
You can see the detailed type definition in @portkey/provider-types project .

------

## __IChain__

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

### __1. `rpcUrl : string`__

`rpcUrl` is the url of the chain's rpc server.  
You can use it to send rpc requests to the chain directly.

### __2. `type : ChainType`__

`type` describes the type of the chain, for now it is either `'aelf'` or `'ethereum'`.  
You can use it to determine which chain the APP are using.

### __3. `chainId : ChainId`__

if `type` is `'aelf'` , `chainId` shows which chain type the APP is on.  
For example, `'AELF'` means mainchain, `'tDVV'` means sidechain.

### __4. `getContract(contractAddress)`__

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

You can see detailed type definition in [source code](https://github.com/Portkey-Wallet/portkey-providers/blob/ed4a131ad1b4d53f0f450a6376cde0d4f5337105/packages/types/src/chain.ts#L7-L14) .

# __Request Method & Generic Types__

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
  request<T extends MethodResponse = any>(params: RequestOption): Promise<T>;
```

You can find the complete type definition like `Accounts` in [source code](https://github.com/Portkey-Wallet/portkey-providers/blob/ed4a131ad1b4d53f0f450a6376cde0d4f5337105/packages/types/src/provider.ts#L37-L53) .

### __1. `method:'chainId'` / `method:'chainIds'`__

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

### __2. `method:'chainsInfo'`__

Gets all the supported chains' information.  

```typescript
provider.request({ method: "chainsInfo" }).then((chainsInfo: ChainsInfo) => {
  console.log('mainchain info',chainsInfo.AELF);
});
```

### __3. `method:'requestAccounts'`__

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

### __4. `method:'accounts'`__

  Returns the current account addresses of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  provider.request({ method: "accounts" }).then((accounts: Accounts) => {
    console.log('the aelf mainchain account:',accounts.AELF);
  });
  ```

### __5. `method:'wallet_getWalletState'`__

  Returns the current wallet state of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.

  ```typescript
  provider.request({ method: "wallet_getWalletState" }).then((walletState: WalletState) => {
    console.log('the current wallet state:',walletState);
  });
  ```

### __6. `method:'wallet_getWalletName'`__

  Returns the current wallet name of the Portkey APP's wallet.  
  __NOTICE__: You should use `request({ method: 'requestAccounts' })` first for the permission to access.
  
  ```typescript
  provider.request({ method: "wallet_getWalletName" }).then((walletName: WalletName) => {
    console.log('the current wallet name:',walletName);
  });
  ```

### __7. `{method:'sendTransaction',payload:SendTransactionParams}`__
  
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
