import { describe, expect, test } from 'vitest';
import { AElfChain } from '../src/chain';
describe('contract describe', () => {
  const chainOptions = {
    request: () => {},
    // mock
    rpcUrl: 'https://aelf-public-node.aelf.io',
    chainType: 'aelf',
    chainId: 'AELF',
  } as any;
  const chain = new AElfChain(chainOptions);
  test('test chain properties', () => {
    expect(chain.type).toBe(chainOptions.chainType);
    expect(chain.chainId).toBe(chainOptions.chainId);
    expect(chain.rpcUrl).toBe(chainOptions.rpcUrl);
  });
});
