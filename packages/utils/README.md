<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>

<h1 align="center">@portkey/provider-utils</h1>

- [Files](#files)
- [1. crypto.ts](#1-cryptots)
- [2. providerInjection.ts](#2-providerinjectionts)
- [3. response.ts](#3-responsets)

Toolbox for Portkey DAPP Operations.  

## Files

## 1. [crypto.ts](./src/crypto.ts)

A crypto toolset for Portkey DAPPs, making communication between Provider and Operator more secure.  
You can see the [test](./test/crypto.test.ts) code for basic usage.  

## 2. [providerInjection.ts](./src/providerInjection.ts)  

This file detects whether current environment is suitable to inject compiled code of Provider, avoiding the risk of exceptions.

## 3. [response.ts](./src/response.ts)  

This file provides some useful functions to generate formatted response objects.
