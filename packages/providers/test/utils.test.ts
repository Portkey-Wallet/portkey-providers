import { describe, expect, test } from '@jest/globals';
import { NotificationEvents, MethodsBase, MethodsWallet } from '@portkey/provider-types';
import { isMethodsBase, isMethodsUnimplemented } from '../src/utils';
import { getHostName, isNotificationEvents } from '../src/utils';

describe('utils describe', () => {
  test('test isMethodsBase', async () => {
    expect(isMethodsBase(MethodsBase.SEND_TRANSACTION)).toBe(true);
    expect(isMethodsBase('')).toBe(false);
  });
  test('test isMethodsUnimplemented', async () => {
    expect(isMethodsUnimplemented(MethodsWallet.GET_WALLET_STATE)).toBe(true);
    expect(isMethodsUnimplemented('')).toBe(false);
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
