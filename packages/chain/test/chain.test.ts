import 'isomorphic-fetch';
import { describe, expect, test } from '@jest/globals';
import { AElfChain } from '../src/chain';
describe('chain describe', () => {
  const chainOptions = {
    request: () => {},
    // mock
    rpcUrl: 'https://aelf-test-node.aelf.io',
    chainType: 'aelf',
    chainId: 'AELF',
  } as any;
  const chain = new AElfChain(chainOptions);
  test('test chain properties', () => {
    expect(chain.type).toBe(chainOptions.chainType);
    expect(chain.chainId).toBe(chainOptions.chainId);
    expect(chain.rpcUrl).toBe(chainOptions.rpcUrl);
  });
  test('test chain contract', async () => {
    const tokenContract = chain.getContract('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE');
    const info = await tokenContract.callViewMethod<{ balance: string; symbol: string; owner: string }>('GetBalance', {
      symbol: 'ELF',
      owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
    });
    expect(info.data).toHaveProperty('symbol');
    expect(info.data).toHaveProperty('balance');
    expect(info.data).toHaveProperty('owner');
  }, 10000);
});
