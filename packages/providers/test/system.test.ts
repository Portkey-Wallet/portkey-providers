import { expect, test } from '@jest/globals';
import {
  ITestPlatform,
  ProducerTestBehaviour,
  CustomerTestBehaviour,
  ICustomerMockStream,
  IProviderMockStream,
  UNKNOWN_METHOD,
} from './entity/TestPlatform';
import {
  IRequestParams,
  NotificationEvents,
  RPCMethodsBase,
  ResponseCode,
  ResponseMessagePreset,
} from '@portkey/provider-types';
import { SubStream } from '../src/DappStream';
import { generateNormalResponse } from '@portkey/provider-utils';

const testPlatform = new ITestPlatform();
const customerStream = new ICustomerMockStream(testPlatform);
const providerStream = new IProviderMockStream(testPlatform);
const customer = new CustomerTestBehaviour({ connectionStream: customerStream });
const producer = new ProducerTestBehaviour(providerStream);
testPlatform.registerCustomer(customer);
testPlatform.registerProducer(producer);

test('normal test goes well', done => {
  customer
    .request({ method: RPCMethodsBase.CHAIN_ID })
    .then(res => {
      console.log('request=====res:', res);
      done();
    })
    .catch(e => done(e));
});

test('unknown method should be rejected', async () => {
  expect.assertions(1);
  try {
    await customer.request({ method: UNKNOWN_METHOD });
  } catch (e) {
    expect(e.message).toMatch(ResponseMessagePreset['UNKNOWN_METHOD']);
  }
});

test('mock provider SubStream reaction', done => {
  const subStream: SubStream = customerStream.createSubStream('mockProvider');
  const name = RPCMethodsBase.CHAIN_ID;
  customer.once(name, res => {
    console.log(res);
    done();
  });
  subStream.write(JSON.stringify({ eventName: name, method: name } as IRequestParams));
});

test('use unimplemented method will receive a rejection', async () => {
  expect.assertions(1);
  try {
    await customer.request({ method: 'sendTransaction', payload: {} as any });
  } catch (e) {
    expect(e.message).toMatch('This method is not implemented yet.');
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
  customer.addListener(NotificationEvents.MESSAGE, () => {
    done();
  });
  providerStream.createMessageEvent('ok');
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
  providerStream.injectData(generateNormalResponse({ eventName: NotificationEvents.ACCOUNTS_CHANGED, data: '0x123' }));
});

test('handle NotificationEvents.NETWORK_CHANGED', done => {
  customer.once(NotificationEvents.NETWORK_CHANGED, () => {
    done();
  });
  providerStream.injectData(generateNormalResponse({ eventName: NotificationEvents.NETWORK_CHANGED, data: '0x456' }));
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

// describe('system check', () => {
//   test('use unimplemented method will receive an rejection', async () => {
//     expect.assertions(1);
//     try {
//       const res = await customer.request({ method: RPCMethodsUnimplemented.ADD_CHAIN });
//       console.log('res', res);
//     } catch (e) {
//       expect(e.message).toMatch('method not found!');
//     }
//   });
// });
