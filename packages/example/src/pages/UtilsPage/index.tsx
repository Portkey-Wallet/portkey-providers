import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AElfChain } from '@portkey/chain';
import { IContract } from '@portkey/types';

const chainOptions = {
  request: () => {},
  rpcUrl: 'https://aelf-test-node.aelf.io',
  chainType: 'aelf',
  chainId: 'AELF',
} as any;
const chain = new AElfChain(chainOptions);

const TokenContractAddressMap = {
  AELF: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
  tDVV: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
  tDVW: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
};

export default function WebWalletPage() {
  const [tokenContract, setTokenContract] = useState<IContract>();

  return (
    <div>
      <div>@portkey/chain</div>

      <button
        onClick={async () => {
          try {
            const tokenContract = chain.getContract(TokenContractAddressMap.AELF);
            setTokenContract(tokenContract);
            console.log(tokenContract, '=====tokenContract');
          } catch (error) {
            console.log(error, '=====getChain');
          }
        }}>
        init Contract
      </button>

      <button
        onClick={async () => {
          try {
            const balance = await tokenContract.callViewMethod<{ balance: string; symbol: string; owner: string }>(
              'GetBalance',
              {
                symbol: 'ELF',
                owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
              },
            );
            console.log(balance, '=====balance');
          } catch (error) {
            alert(error.message);
          }
        }}>
        Get Balance
      </button>
    </div>
  );
}
