import { describe, test } from '@jest/globals';
import {
  ITestPlatform,
  ProducerTestBehaviour,
  CustomerTestBehaviour,
  ICustomerMockStream,
  IProviderMockStream,
  TEST_METHOD,
} from './entity/TestPlatform';
import { CryptoManager } from '@portkey/provider-utils';
import { subtle } from 'crypto';

const cryptoManager = new CryptoManager(subtle);
const testPlatform = new ITestPlatform();
const customerStream = new ICustomerMockStream(testPlatform);
const providerStream = new IProviderMockStream(testPlatform);
const customer = new CustomerTestBehaviour({ connectionStream: customerStream, cryptoTool: cryptoManager });
const producer = new ProducerTestBehaviour(providerStream, cryptoManager);
testPlatform.registerCustomer(customer);
testPlatform.registerProducer(producer);

describe('system check', () => {
  test('test platform', done => {
    customer
      .request({ method: TEST_METHOD })
      .then(res => {
        console.log(res);
        done();
      })
      .catch(e => done(e));
  });
});
