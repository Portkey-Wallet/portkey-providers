import { describe, expect, test } from '@jest/globals';
import { RPCMethodsBase, RPCMethodsUnimplemented } from '@portkey/provider-types';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from '../src/utils';

describe('utils describe', () => {
  test('test isRPCMethodsBase', async () => {
    expect(isRPCMethodsBase(RPCMethodsBase.SEND_TRANSACTION)).toBe(true);
    expect(isRPCMethodsBase('')).toBe(false);
  });
  test('test isRPCMethodsUnimplemented', async () => {
    expect(isRPCMethodsUnimplemented(RPCMethodsUnimplemented.ADD_CHAIN)).toBe(true);
    expect(isRPCMethodsUnimplemented('')).toBe(false);
  });
});
