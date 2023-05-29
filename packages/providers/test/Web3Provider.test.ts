import 'isomorphic-fetch';
import { describe, expect, test } from '@jest/globals';
import { Web3Provider, DappInteractionStream } from '../src';
import { EventEmitter } from 'stream';
import { RPCMethodsBase } from '@portkey/provider-types';
const noop = () => undefined;

// mock post message
const mockEvent = new EventEmitter();

class MockServer {
  postMessage(message) {
    console.log(message, '======message');

    const { eventName, method } = JSON.parse(message);

    switch (method) {
      case RPCMethodsBase.SEND_TRANSACTION: {
        setTimeout(() => {
          this.pushMessage(eventName, { code: 0, data: { transactionId: 'transactionId' }, msg: 'hello servers' });
        }, 1000);
        break;
      }
      case RPCMethodsBase.REQUEST_ACCOUNTS: {
        setTimeout(() => {
          this.pushMessage(eventName, {
            code: 0,
            data: { AELF: ['address'], tDVV: ['address'] },
            msg: 'hello servers',
          });
        }, 1000);
        break;
      }
    }
  }

  pushMessage(eventName, info) {
    mockEvent.emit(
      'message',
      JSON.stringify({
        eventName,
        info,
      }),
    );
  }
  readMessage(message) {
    this.postMessage(message);
  }
}
const server = new MockServer();

class MockStream extends DappInteractionStream {
  constructor() {
    super();
    mockEvent.addListener('message', this._onMessage.bind(this));
  }
  _read = noop;
  _onMessage(message) {
    this.push(message);
  }
  _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
    try {
      server.readMessage(chunk.toString());
    } catch (err) {
      return callback(new Error('MockStream - disconnected'));
    }
    callback();
  }
}

class MockProvider extends Web3Provider {}

const stream = new MockStream();

describe('chain describe', () => {
  const provider = new MockProvider({ connectionStream: stream });
  const chain = provider.getChain('AELF');
  test('test getChain', async () => {
    const height = await chain.getBlockHeight();
    console.log(height, '=====height');
    expect(1).toBe(1);
  });
  test('test tokenContract callViewMethod', async () => {
    const tokenContract = chain.getContract('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE');
    const info = await tokenContract.callViewMethod<{ balance: string; symbol: string; owner: string }>('GetBalance', {
      symbol: 'ELF',
      owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
    });
    expect(info).toHaveProperty('symbol');
    expect(info).toHaveProperty('balance');
    expect(info).toHaveProperty('owner');
  }, 10000);

  test('test request accounts', async () => {
    const account = await provider.request<{ AELF?: string[]; tDVV?: string[] }>({
      method: RPCMethodsBase.REQUEST_ACCOUNTS,
    });
    console.log(account, '=======account');
    expect(account).toHaveProperty('AELF');
    expect(account).toHaveProperty('tDVV');
  }, 10000);

  test('test tokenContract callSendMethod', async () => {
    const tokenContract = chain.getContract('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE');
    const req = await tokenContract.callSendMethod<{ transactionId: string }>('Transfer', '', {
      symbol: 'ELF',
      owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
    });
    expect(req).toHaveProperty('transactionId');
  }, 10000);
});
