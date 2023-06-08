import { describe, expect, test } from '@jest/globals';
import { IResponseType, IRequestParams, MethodsBase, ResponseCode } from '@portkey/provider-types';
import {
  CustomerTestBehaviour,
  IProviderMockStream,
  ITestPlatform,
  InjectDataMethod,
  ProducerTestBehaviour,
  TestPlatform,
} from './entity/TestPlatform';
import { PortkeyPostOptions, PortkeyPostStream } from '../src/portkeyPostStream';
import { doNotHappen } from './entity/DoNotHappen';

// PortkeyPostStream works with the Provider
// So it receives data from the Provider and sends it using the postMessage method

const rejectMark = 'you-know-who';
const realWindow = globalThis.window;
const unknownMethod = 'unknownMethod';
const myOrigin = 'http://www.mock.com';
const unknownOrigin = 'http://www.unknown.com';
const anyOriginMark = '*';
const targetName = '42';

class PostStreamTestPlatform extends ITestPlatform {
  constructor(private _anyWindow?: FakeWindow) {
    super();
  }

  setWindow = (window: FakeWindow) => {
    this._anyWindow = window;
  };

  sendResponse = (message: Buffer) => {
    console.log('PostStreamTestPlatform::sendResponse', message);
    this._anyWindow?.emit('message', message.toString());
  };
}

export class FakeWindow implements PostWindowLike {
  constructor(private _platform: TestPlatform) {}

  public addEventListener = (event: string, callback: (data) => void, option?: boolean) => {
    realWindow.addEventListener(event, callback, option);
  };

  public emit = (event: string, data: any) => {
    realWindow.dispatchEvent(new MessageEvent(event, { data }));
  };

  public location = {
    origin: myOrigin,
  };

  postMessage = (message: string) => {
    if (message.includes(rejectMark)) throw new Error('reject');
    console.log('FakeWindow::postMessage', message);
    this._platform.sendMessage(JSON.parse(message));
  };
}

interface PostWindowLike {
  postMessage: (message: string) => void;
}

class TestStream extends PortkeyPostStream implements InjectDataMethod {
  getName = () => this._name;
  injectData(data: IResponseType<any> | IRequestParams<any>): void {
    this.write(JSON.stringify(data));
  }
  getOrigin = () => this._origin;
}

const mTestPlatform = new PostStreamTestPlatform();
const fakeWindow = new FakeWindow(mTestPlatform);
const providerStream = new IProviderMockStream(mTestPlatform);
const producer = new ProducerTestBehaviour(providerStream);
mTestPlatform.registerProducer(producer);
mTestPlatform.setWindow(fakeWindow);

const testWrapper = ({ name, targetWindow }: Partial<PortkeyPostOptions>) => {
  global.window = fakeWindow as any;
  const testStream = new TestStream({ name: name ?? '*', postWindow: fakeWindow, targetWindow });
  const customer = new CustomerTestBehaviour({
    connectionStream: testStream,
  });
  mTestPlatform.registerCustomer(customer);
  test('system check well', done => {
    customer
      .request({ method: MethodsBase.CHAIN_ID })
      .then(res => {
        console.log('request=====res:', res);
        done();
      })
      .catch(e => done(e));
  });
  test('exception will throw', done => {
    testStream._write(JSON.stringify({ data: rejectMark }), 'utf8', _e => {
      done();
    });
  });
  test('exception created by error message will be caught and not be thrown', () => {
    ['i-am-error', {}, undefined, null, 'undefined', 'null'].forEach(errorMsg => {
      expect(() => fakeWindow.emit('message', errorMsg)).not.toThrow();
    });
  });
  test('unexpected message will not be received', done => {
    const expectedToReceive = testStream.getOrigin() === anyOriginMark || testStream.getName() === unknownOrigin;
    doNotHappen(reject => {
      customer.addListener(unknownMethod, () => {
        !expectedToReceive ? reject('should not be called') : done();
      });
    })
      .then(() => done())
      .catch(e => done(e));
    producer.publishEvent({ eventName: unknownMethod, info: { code: ResponseCode.SUCCESS }, origin: unknownOrigin });
  });
  test('targetName message will only be received by targetName stream', done => {
    const expectedToReceive = testStream.getName() === targetName;
    doNotHappen(reject => {
      customer.addListener(unknownMethod, () => {
        !expectedToReceive ? reject('should not be called') : done();
      });
    })
      .then(() => done())
      .catch(e => done(e));
    producer.publishEvent({ eventName: unknownMethod, info: { code: ResponseCode.SUCCESS }, target: targetName });
  });
  test('non-complete message will not be received', done => {
    doNotHappen(reject => {
      customer.addListener(unknownMethod, () => {
        reject('should not be called');
      });
    })
      .then(() => done())
      .catch(e => done(e));
    producer.publishEvent({ eventName: unknownMethod, info: undefined as any, target: targetName });
  });
};
describe('PortkeyPostStream test', () => {
  const configs: Array<Partial<PortkeyPostOptions>> = [
    { name: 'default stream' },
    { name: '* origin stream', targetWindow: 'any' },
    { name: targetName },
  ];
  configs.forEach(testWrapper);
});

globalThis.window = realWindow;
