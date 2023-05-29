// Provides a virtual platform for test

import {
  CryptoResponse,
  CryptoRequest,
  IDappRequestResponse,
  IDappRequestWrapper,
  ResponseCode,
  IDappResponseWrapper,
  RPCMethods,
} from '@portkey/provider-types';
import { DappInteractionStream } from '../../src/DappStream';
import BaseProvider from '../../src/BaseProvider';
import Operator from '../../src/Operator';

export const TEST_METHOD = 'test' as any;

export class ITestPlatform implements TestPlatform {
  private _customer: CustomerTestBehaviour;
  private _producer: ProducerTestBehaviour;

  registerCustomer = (customer: CustomerTestBehaviour) => {
    this._customer = customer;
  };
  registerProducer = (producer: ProducerTestBehaviour) => {
    this._producer = producer;
  };

  sendMessage = (message: CryptoRequest) => {
    this._producer.onMessage(message);
  };
  sendResponse = (message: CryptoResponse) => {
    this._customer.onMessage(message);
  };
}

export class IProviderMockStream extends DappInteractionStream {
  private _platform: TestPlatform;
  constructor(platform: TestPlatform) {
    super();
    this._platform = platform;
  }
  _write(chunk: ArrayBuffer, _encoding: BufferEncoding, _callback: (error?: Error | null | undefined) => void): void {
    const convertedText: string = new TextDecoder().decode(chunk);
    console.log('producerStream=====_write=', convertedText);
    this._platform.sendResponse(JSON.parse(convertedText));
  }
}

export class ICustomerMockStream extends DappInteractionStream {
  private _platform: TestPlatform;
  constructor(platform: TestPlatform) {
    super();
    this._platform = platform;
  }
  _write(chunk: ArrayBuffer, _encoding: BufferEncoding, _callback: (error?: Error | null | undefined) => void): void {
    const convertedText: string = new TextDecoder().decode(chunk);
    console.log('customerStream=====_write=', convertedText);
    this._platform.sendMessage(JSON.parse(convertedText));
  }
}

export interface TestPlatform {
  registerCustomer(customer: CustomerTestBehaviour): void;
  registerProducer(producer: ProducerTestBehaviour): void;
  sendMessage(message: CryptoRequest): void;
  sendResponse(message: CryptoResponse): void;
}

export class ProducerTestBehaviour extends Operator {
  onMessage = async (message: CryptoRequest): Promise<void> => {
    console.log('testOperator=======onMessage', message);
    this.handleRequestMessage(JSON.stringify(message));
  };

  public handleRequest = async (request: IDappRequestWrapper): Promise<IDappRequestResponse<any>> => {
    const {
      params: { method },
    } = request || {};
    if (method === TEST_METHOD) {
      return { code: ResponseCode.SUCCESS, message: 'success' } as IDappRequestResponse;
    }
    return { code: ResponseCode.UNKNOWN_METHOD, message: 'error' } as IDappRequestResponse;
  };
}

export class CustomerTestBehaviour extends BaseProvider {
  methodCheck = (method: string): method is RPCMethods => {
    return !!method;
  };

  onMessage = async (message: CryptoResponse): Promise<void | never> => {
    const { raw } = message || {};
    if (!(raw?.length > 0)) throw new Error('invalid raw');
    const response = JSON.parse(await this.readCryptoData(raw)) as IDappResponseWrapper;
    const {
      params: { code },
      eventId,
    } = response || {};
    if (code !== ResponseCode.SUCCESS) throw new Error('invalid response');
    this.emit(eventId, response.params);
  };
}
