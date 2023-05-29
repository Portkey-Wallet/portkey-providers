// Provides a virtual platform for test

import { ResponseCode, IResponseType, RPCMethods, IRequestParams } from '@portkey/provider-types';
import { generateNormalResponse, generateErrorResponse } from '@portkey/provider-utils';
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

  sendMessage = (message: IRequestParams) => {
    this._producer.onMessage(message);
  };
  sendResponse = (message: IResponseType) => {
    this._customer.onMessage(message);
  };
}

export class IProviderMockStream extends DappInteractionStream {
  private _platform: TestPlatform;
  constructor(platform: TestPlatform) {
    super();
    this._platform = platform;
  }
  _read: (_size?: number | undefined) => undefined;
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
  _read: (_size?: number | undefined) => undefined;
  _write(chunk: ArrayBuffer, _encoding: BufferEncoding, _callback: (error?: Error | null | undefined) => void): void {
    const convertedText: string = new TextDecoder().decode(chunk);
    console.log('customerStream=====_write=', convertedText);
    this._platform.sendMessage(JSON.parse(convertedText));
  }
}

export interface TestPlatform {
  registerCustomer(customer: CustomerTestBehaviour): void;
  registerProducer(producer: ProducerTestBehaviour): void;
  sendMessage(message: IRequestParams): void;
  sendResponse(message: IResponseType): void;
}

export class ProducerTestBehaviour extends Operator {
  onMessage = async (message: IRequestParams): Promise<void> => {
    console.log('testOperator=======onMessage', message);
    this.handleRequestMessage(JSON.stringify(message));
  };

  public handleRequest = async (request: IRequestParams): Promise<IResponseType<any>> => {
    const { eventName, method } = request || {};
    console.log(request, '=====request-handleRequest');

    if (method === TEST_METHOD) {
      return generateNormalResponse({ code: ResponseCode.SUCCESS, eventName, data: { test: null } });
    }
    return generateErrorResponse({ code: ResponseCode.UNKNOWN_METHOD, eventName });
  };
}

export class CustomerTestBehaviour extends BaseProvider {
  methodCheck = (method: string): method is RPCMethods => {
    return !!method;
  };

  protected getOrigin = (): string => {
    return window.location.origin;
  };

  onMessage = async (response: IResponseType): Promise<void | never> => {
    const {
      info: { code },
      eventName,
    } = response || {};
    if (code !== ResponseCode.SUCCESS) throw new Error('invalid response');
    this.emit(eventName, response.info);
  };
}
