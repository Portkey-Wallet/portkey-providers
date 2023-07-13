import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accounts,
  ChainIds,
  IAElfChain,
  IPortkeyProvider,
  MethodsBase,
  MethodsWallet,
  NetworkType,
  NotificationEvents,
  ProviderErrorType,
} from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import { IContract } from '@portkey/types';
import { Actions, State, useExampleState } from './hooks';
import './index.css';
import { scheme } from '@portkey/utils';

function App() {
  const [provider, setProvider] = useState<IPortkeyProvider>();
  const [state, dispatch] = useExampleState();

  const setState = useCallback((payload: State, actions: Actions = Actions.setState) => {
    dispatch({ type: actions, payload });
  }, []);

  const [chain, setChain] = useState<IAElfChain>();
  const [tokenContract, setTokenContract] = useState<IContract>();

  const connectEagerly = useCallback(async () => {
    const accounts = await provider.request({ method: MethodsBase.ACCOUNTS });
    setState({ accounts });
  }, [provider]);

  const initProvider = useCallback(async () => {
    try {
      console.log(window.portkey, '=window.portkey');
      setProvider(await detectProvider());
    } catch (error) {
      console.log(error, '=====error');
    }
  }, []);
  const accountsChanged = (accounts: Accounts) => {
    setState({ accounts });
  };
  const chainChanged = (chainIds: ChainIds) => {
    setState({ chainIds });
  };
  const networkChanged = async (networkType: NetworkType) => {
    setState({ network: networkType });
    const _chain = await provider.getChain('AELF');
    setChain(_chain);
  };
  const connected = async (connectInfo: NetworkType) => {
    const result = await provider.request({
      method: MethodsBase.ACCOUNTS,
    });
    setState({ accounts: result });
  };
  const disconnected = (error: ProviderErrorType) => {
    console.log(error, '=====disconnected');
    connectEagerly();
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
    window.addEventListener(
      'message',
      event => {
        console.log(event.data, '===event.data');
      },
      true,
    );
    initProvider();
  }, []);
  useEffect(() => {
    if (!provider) return;
    initListener();
    connectEagerly();
    return () => {
      removeListener();
    };
  }, [provider]);
  return (
    <div>
      {Object.entries(state).map(([key, value]) => {
        return (
          <p key={key}>
            <a>{key}</a>
            <br />
            {JSON.stringify(value)}
          </p>
        );
      })}
      <button onClick={initProvider}>init provider</button>
      <button
        onClick={async () => {
          alert(provider.isConnected());
        }}>
        isConnected
      </button>
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
          try {
            const _chain = await provider.getChain('tDVV');
            setChain(_chain);
          } catch (error) {
            alert(error.message);
          }
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
            const balance = await tokenContract.callSendMethod('Transfer', '', {
              symbol: 'ELF',
              to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
              amount: 1,
            });
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
            const sin = await provider.request({
              method: MethodsWallet.GET_WALLET_SIGNATURE,
              payload: { data: Date.now().toString() },
            });
            console.log(sin, '=======sin');
          } catch (error) {
            alert(error.message);
          }
        }}>
        GET_WALLET_SIGNATURE
      </button>
      <button
        onClick={async () => {
          try {
            const network = await provider.request({
              method: MethodsBase.NETWORK,
            });
            setState({ network });
          } catch (error) {
            alert(error.message);
          }
        }}>
        NETWORK
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
          try {
            const result = await provider.request({
              method: MethodsBase.REQUEST_ACCOUNTS,
            });
            setState({ accounts: result });
          } catch (error) {
            alert(error.message);
          }
        }}>
        onConnect
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.ACCOUNTS,
          });
          setState({ accounts: result });
        }}>
        ACCOUNTS
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.CHAIN_ID,
          });
          setState({ chainIds: result });
        }}>
        CHAIN_ID
      </button>
      <button
        onClick={async () => {
          const result = await provider.request({
            method: MethodsBase.CHAINS_INFO,
          });
          setState({ chainsInfo: result });
        }}>
        CHAINS_INFO
      </button>
      {/* <button
        onClick={async () => {
          try {
            const walletName = await provider.request({
              method: MethodsWallet.GET_WALLET_NAME,
            });
            setState({ walletName });
          } catch (error) {
            alert(error.message);
          }
        }}>
        GET_WALLET_NAME
      </button> */}
      <button onClick={removeListener}>removeListener</button>
      <button
        onClick={async () => {
          window.location.href = scheme.formatScheme({
            domain: window.location.host,
            action: 'linkDapp',
            custom: { url: window.location.href },
          });
        }}>
        linkDapp
      </button>
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
