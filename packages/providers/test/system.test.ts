import { describe, expect, jest, test } from '@jest/globals';
import {
  ITestPlatform,
  ProducerTestBehaviour,
  CustomerTestBehaviour,
  ICustomerMockStream,
  IProviderMockStream,
} from './entity/TestPlatform';
import { NotificationEvents, MethodsBase, ResponseCode, ResponseMessagePreset } from '@portkey/provider-types';
import { generateNormalResponse } from '@portkey/provider-utils';
import { PortkeyProvider } from '../src/portkeyProvider';
import { PortkeyPostStream } from '../src/portkeyPostStream';
import { Web3Provider } from '../src/web3Provider';

class TestPortkeyProviderBehaviour extends PortkeyProvider {
  onMessageRaw = async (response: Buffer): Promise<void | never> => {
    this._onData(response);
  };

  public mockNullMessage = () => {
    this._onData(null as any);
  };

  public mockBlankMessage = () => {
    this._onData('' as any);
  };
}

class TestWeb3ProviderBehaviour extends Web3Provider {
  onMessageRaw = async (response: Buffer): Promise<void | never> => {
    this._onData(response);
  };

  public mockNullMessage = () => {
    this._onData(null as any);
  };

  public mockBlankMessage = () => {
    this._onData('' as any);
  };
}

const testPlatform = new ITestPlatform();
const customerStream = new ICustomerMockStream(testPlatform);
const providerStream = new IProviderMockStream(testPlatform);
const customer = new CustomerTestBehaviour({ connectionStream: customerStream });
const producer = new ProducerTestBehaviour(providerStream);
testPlatform.registerCustomer(customer);
testPlatform.registerProducer(producer);

describe('system describe', () => {
  test('normal test goes well', done => {
    customer
      .request({ method: MethodsBase.CHAIN_ID })
      .then(res => {
        console.log('request=====res:', res);
        done();
      })
      .catch(e => done(e));
  });

  test('test invalid params ', async () => {
    try {
      await customer.request('' as any);
    } catch (error) {
      expect(error.message).toEqual('Expected a single, non-array, object argument.');
    }
  });

  test('test invalid payload ', async () => {
    try {
      await customer.request({ method: MethodsBase.SEND_TRANSACTION, payload: '' as any });
    } catch (error) {
      expect(error.message).toEqual(`'params.payload' must be an object if provided.`);
    }
  });

  // SubStream Behaviour is not implemented in current DappStream yet
  test('mock provider SubStream reaction', () => {
    expect(customerStream.createSubStream('mockProvider')).toBeUndefined();
  });

  test('expect _read() returns falsy', () => {
    expect(customerStream._read()).toBeFalsy();
  });

  // test('mock provider SubStream reaction', done => {
  //   const subStream: SubStream = customerStream.createSubStream('mockProvider');
  //   const name = MethodsBase.CHAIN_ID;
  //   customer.once(name, res => {
  //     console.log(res);
  //     done();
  //   });
  //   subStream.write(JSON.stringify({ eventName: name, method: name } as IRequestParams));
  // });

  test('use unimplemented method will receive a rejection', async () => {
    expect.assertions(1);
    try {
      const result = await customer.request({ method: 'sendTransaction', payload: {} as any });
      throw new Error('should not be here, result: ' + result);
    } catch (e) {
      expect(e.message).toMatch(ResponseMessagePreset['UNIMPLEMENTED']);
    }
  });

  test('use unknown method name will be rejected', async () => {
    expect.assertions(1);
    try {
      await customer.request({ method: 'unknownMethod' as any, payload: {} as any });
    } catch (e) {
      expect(e.message).toMatch(ResponseMessagePreset['UNKNOWN_METHOD']);
    }
  });

  test('provider::emit goes well', done => {
    const mockEventName = 'mock';
    const onMessage = () => {
      done();
      customer.removeListener(mockEventName, onMessage);
    };
    customer.on(mockEventName, onMessage);
    customer.emit(mockEventName, {});
  });

  test('handle message event', done => {
    const expectMessage = 'ok';
    customer.addListener(NotificationEvents.MESSAGE, data => {
      console.log('handle message event:', data);
      if (data !== expectMessage) return;
      done();
    });
    providerStream.createMessageEvent(expectMessage);
  });

  test('handle NotificationEvents.CONNECTED', done => {
    customer.once(NotificationEvents.CONNECTED, () => {
      done();
    });
    producer.publishEvent(generateNormalResponse({ eventName: NotificationEvents.CONNECTED }));
  });

  test('handle NotificationEvents.ACCOUNTS_CHANGED', done => {
    customer.once(NotificationEvents.ACCOUNTS_CHANGED, () => {
      done();
    });
    providerStream.injectData(
      generateNormalResponse({ eventName: NotificationEvents.ACCOUNTS_CHANGED, data: '0x123' }),
    );
  });

  test('handle NotificationEvents.NETWORK_CHANGED', done => {
    customer.once(NotificationEvents.NETWORK_CHANGED, () => {
      done();
    });
    providerStream.injectData(generateNormalResponse({ eventName: NotificationEvents.NETWORK_CHANGED, data: '0x456' }));
  });

  test('handle NotificationEvents.CHAIN_CHANGED', done => {
    customer.once(NotificationEvents.CHAIN_CHANGED, () => {
      done();
    });
    providerStream.injectData(
      generateNormalResponse({ eventName: NotificationEvents.CHAIN_CHANGED, data: ['mockChainId'] }),
    );
  });

  test('handle NotificationEvents.DISCONNECTED', done => {
    customer.once(NotificationEvents.DISCONNECTED, () => {
      done();
    });
    providerStream.injectData(generateNormalResponse({ eventName: NotificationEvents.DISCONNECTED }));
  });

  test('handle null request', done => {
    customer.once(NotificationEvents.MESSAGE, (info: string) => {
      expect(info).toEqual('invalid message');
      done();
    });
    producer.handleRequestMessage('');
  });

  test('handle error response', () => {
    expect(() => customer.mockNullMessage()).not.toThrow();
    expect(() => customer.mockBlankMessage()).not.toThrow();
  });

  test('handle uncovered notification', done => {
    customer.once(NotificationEvents.ERROR, () => {
      done();
    });
    providerStream.injectData(
      generateNormalResponse({ eventName: NotificationEvents.ERROR, code: ResponseCode.SUCCESS, data: '0x789' }),
    );
  });

  test('handle unknown eventName', done => {
    const name = 'unknown';
    customer.once(name, () => {
      done();
    });
    providerStream.injectData(generateNormalResponse({ eventName: name, code: ResponseCode.SUCCESS }));
  });

  test('operator handles wrong data', () => {
    expect(() => producer.handleRequestMessage('{{{')).not.toThrow();
  });
});

describe('PortkeyProvider test', () => {
  let portkeyProvider: PortkeyProvider;
  test('function well', () => {
    portkeyProvider = new PortkeyProvider({
      connectionStream: new PortkeyPostStream({
        name: 'test stream',
        postWindow: { postMessage: jest.fn(), location: { origin: '*' } },
      }),
    });
    expect(portkeyProvider).toBeTruthy();
    expect(() => portkeyProvider.getInitialize()).not.toThrow();
    expect(portkeyProvider.isConnected()).not.toBeUndefined();
  });

  test('init success', async () => {
    const testProvider = new TestPortkeyProviderBehaviour({
      connectionStream: customerStream,
    });
    expect(testProvider).toBeTruthy();
    testPlatform.registerCustomer(testProvider);
    await testProvider.getInitialize();
    // the second time call init() on test platform will not be resolved
    await testProvider.getInitialize();
  });
});

describe('PortkeyProvider test', () => {
  let web3Provider: TestWeb3ProviderBehaviour;
  test('function well', async () => {
    web3Provider = new TestWeb3ProviderBehaviour({
      connectionStream: customerStream,
    });
    testPlatform.registerCustomer(web3Provider);
    expect(web3Provider).toBeTruthy();
    await expect(web3Provider.getChain('AELF')).resolves.toBeTruthy();
    await expect(web3Provider.getChain('tDVV')).rejects.toThrow();
  });
});
