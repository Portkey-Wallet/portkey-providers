import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accounts,
  ChainIds,
  IChain,
  IContract,
  IWeb3Provider,
  MethodsBase,
  NetworkType,
  NotificationEvents,
  ProviderErrorType,
} from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import './index.css';
function App() {
  const [provider, setProvider] = useState<IWeb3Provider>();
  const [chain, setChain] = useState<IChain>();
  const [tokenContract, setTokenContract] = useState<IContract>();

  const initProvider = useCallback(async () => {
    try {
      console.log(window.portkey, '=window.portkey');
      setProvider(await detectProvider());
    } catch (error) {
      console.log(error, '=====error');
    }
  }, []);
  const accountsChanged = (accounts: Accounts) => {
    console.log(accounts, '====accountsChanged');
  };
  const chainChanged = (chainIds: ChainIds) => {
    console.log(chainIds, '====chainChanged');
  };
  const networkChanged = (networkType: NetworkType) => {
    console.log(networkType, '====networkChanged');
  };
  const connected = (connectInfo: NetworkType) => {
    console.log(connectInfo, '====networkChanged');
  };
  const disconnected = (error: ProviderErrorType) => {
    console.log(error, '====networkChanged');
  };

  const initListener = () => {
    provider.on(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider.on(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider.on(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider.on(NotificationEvents.CONNECTED, connected);
    provider.on(NotificationEvents.DISCONNECTED, disconnected);
  };
  const removeListener = () => {
    provider.removeListener(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider.removeListener(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider.removeListener(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider.removeListener(NotificationEvents.CONNECTED, connected);
    provider.removeListener(NotificationEvents.DISCONNECTED, disconnected);
  };
  useEffect(() => {
    console.log('useEffect');
    initProvider();
  }, []);
  useEffect(() => {
    if (!provider) return;
    initListener();
    return () => {
      removeListener();
    };
  }, [provider]);
  return (
    <div>
      <button onClick={initProvider}>init provider</button>
      <button
        onClick={async () => {
          try {
            const _chain = await provider.getChain('AELF');
            setChain(_chain);
            setTokenContract(_chain.getContract('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE'));
          } catch (error) {
            console.log(error, '=====getChain');
          }
        }}>
        getChain
      </button>
      <button
        onClick={async () => {
          const _chain = await provider.getChain('tDVV');
          setChain(_chain);
          setTokenContract(_chain.getContract('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE'));
        }}>
        getChain Error
      </button>
      <button
        onClick={async () => {
          try {
            const height = await chain.getBlockHeight();
            console.log(height, '====height');
            alert(height);
          } catch (error) {
            console.log(error, '====error');
          }
        }}>
        getBlockHeight
      </button>
      <button
        onClick={async () => {
          try {
            const balance = await tokenContract.callViewMethod('GetBalance', {
              symbol: 'ELF',
              owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
            });
            console.log(balance, '=====balance');
          } catch (error) {
            console.log(error, '====error');
          }
        }}>
        GetBalance
      </button>

      <button
        onClick={async () => {
          try {
            const balance = await tokenContract.callSendMethod(
              'Transfer',
              '',
              {
                symbol: 'ELF',
                to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                amount: 1,
              },
              // { onMethod: 'receipt' },
            );
            console.log(balance, '=====balance');
          } catch (error) {
            alert(error.message);
          }
        }}>
        Transfer
      </button>
      <button
        onClick={async () => {
          try {
            const balance = await tokenContract.callSendMethod(
              'Transfer',
              '',
              {
                symbol: 'ELF',
                to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                amount: 1,
              },
              { onMethod: 'receipt' },
            );
            console.log(balance, '=====balance');
          } catch (error) {
            alert(error.message);
          }
        }}>
        Transfer receipt
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.REQUEST_ACCOUNTS,
          });
          console.log(result, 'result=====onConnect');
        }}>
        onConnect
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.ACCOUNTS,
          });
          console.log(result, 'result=====onConnect');
        }}>
        ACCOUNTS
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.CHAIN_ID,
          });
          console.log(result, 'result=====onConnect');
        }}>
        CHAIN_ID
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.CHAINS_INFO,
          });
          console.log(result, 'result=====onConnect');
        }}>
        CHAINS_INFO
      </button>
      <button onClick={removeListener}>removeListener</button>
    </div>
  );
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
