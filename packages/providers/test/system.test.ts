import { describe, expect, test } from '@jest/globals';
import {
  ITestPlatform,
  ProducerTestBehaviour,
  CustomerTestBehaviour,
  ICustomerMockStream,
  IProviderMockStream,
  UNKNOWN_METHOD,
} from './entity/TestPlatform';
import { IRequestParams, NotificationEvents, RPCMethodsBase, RPCMethodsUnimplemented } from '@portkey/provider-types';
import { SubStream } from '../src/DappStream';

const testPlatform = new ITestPlatform();
const customerStream = new ICustomerMockStream(testPlatform);
const providerStream = new IProviderMockStream(testPlatform);
const customer = new CustomerTestBehaviour({ connectionStream: customerStream });
const producer = new ProducerTestBehaviour(providerStream);
testPlatform.registerCustomer(customer);
testPlatform.registerProducer(producer);

describe('system check', () => {
  test('normal test goes well', done => {
    customer
      .request({ method: RPCMethodsBase.CHAIN_ID })
      .then(res => {
        console.log(res);
        done();
      })
      .catch(e => done(e));
  });

  test('unknown method should be rejected', async () => {
    expect.assertions(1);
    try {
      return await customer.request({ method: UNKNOWN_METHOD });
    } catch (e) {
      expect(e.message).toMatch('method not found!');
    }
  });
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
    return await customer.request({ method: RPCMethodsUnimplemented.ADD_CHAIN });
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
