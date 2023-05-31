import { describe, expect, test } from '@jest/globals';
import { NotificationEvents, RPCMethodsBase, RPCMethodsUnimplemented } from '@portkey/provider-types';
import { isRPCMethodsBase, isRPCMethodsUnimplemented } from '../src/utils';
import { getHostName, isNotificationEvents } from '../src/utils';

describe('utils describe', () => {
  test('test isRPCMethodsBase', async () => {
    expect(isRPCMethodsBase(RPCMethodsBase.SEND_TRANSACTION)).toBe(true);
    expect(isRPCMethodsBase('')).toBe(false);
  });
  test('test isRPCMethodsUnimplemented', async () => {
    expect(isRPCMethodsUnimplemented(RPCMethodsUnimplemented.ADD_CHAIN)).toBe(true);
    expect(isRPCMethodsUnimplemented('')).toBe(false);
  });
  test('test isNotificationEvents', async () => {
    expect(isNotificationEvents(NotificationEvents.ACCOUNTS_CHANGED)).toBe(true);
    expect(isNotificationEvents('')).toBe(false);
  });
});

describe('getHostName', () => {
  test('goes well', () => {
    const testList = [
      'https://www.portkey.finance/mock?name=portkey&age=1',
      'https://www.portkey.finance/mock',
      'https://www.portkey.finance/mock/',
      'http://www.portkey.finance/mock/',
      'http://www.portkey.finance/mock',
    ];
    const expectedResultHttps = 'https://www.portkey.finance';
    const expectedResultHttp = 'http://www.portkey.finance';
    testList.forEach(item =>
      expect(getHostName(item) === expectedResultHttp || getHostName(item) === expectedResultHttps).toBe(true),
    );
  });
  test('default', () => {
    const url = 'ftp://www.portkey.finance/mock';
    expect(getHostName(url)).toBe('unknown');
  });
});
