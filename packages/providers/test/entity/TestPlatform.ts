// Provides a virtual platform for test

import { ResponseCode, IResponseType, IRequestParams, RPCMethodsBase } from '@portkey/provider-types';
import { generateNormalResponse, generateErrorResponse } from '@portkey/provider-utils';
import { DappInteractionStream } from '../../src/DappStream';
import BaseProvider from '../../src/BaseProvider';
import Operator from '../../src/Operator';

export const UNKNOWN_METHOD = '42' as any;

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
  sendResponse = (message: Buffer) => {
    this._customer.onMessageRaw(message);
  };
}

export class IProviderMockStream extends DappInteractionStream implements InjectDataMethod {
  private _platform: TestPlatform;
  constructor(platform: TestPlatform) {
    super();
    this._platform = platform;
  }
  _read: (_size?: number | undefined) => undefined;
  _write(chunk: ArrayBuffer, _encoding: BufferEncoding, _callback: (error?: Error | null | undefined) => void): void {
    this._platform.sendResponse(chunk);
    return _callback();
  }
  injectData(data: IResponseType<any> | IRequestParams<any>): void {
    this.write(JSON.stringify(data));
  }
}

export class ICustomerMockStream extends DappInteractionStream implements InjectDataMethod {
  private _platform: TestPlatform;
  constructor(platform: TestPlatform) {
    super();
    this._platform = platform;
  }
  _read: (_size?: number | undefined) => undefined;
  _write(chunk: ArrayBuffer, _encoding: BufferEncoding, _callback: (error?: Error | null | undefined) => void): void {
    const convertedText: string = new TextDecoder().decode(chunk);
    console.log('ICustomerMockStream::_write', convertedText);
    this._platform.sendMessage(JSON.parse(convertedText));
    return _callback();
  }
  injectData(data: IResponseType<any> | IRequestParams<any>): void {
    this.write(JSON.stringify(data));
  }
}

export interface TestPlatform {
  registerCustomer(customer: CustomerTestBehaviour): void;
  registerProducer(producer: ProducerTestBehaviour): void;
  sendMessage(message: IRequestParams): void;
  sendResponse(message: ArrayBuffer): void;
}

export interface InjectDataMethod {
  injectData(data: IResponseType | IRequestParams): void;
}

export class ProducerTestBehaviour extends Operator {
  onMessage = async (message: IRequestParams): Promise<void> => {
    console.log('testOperator=======onMessage', message);
    this.handleRequestMessage(JSON.stringify(message));
  };

  public handleRequest = async (request: IRequestParams): Promise<IResponseType<any>> => {
    const { eventName, method } = request || {};
    console.log(request, '=====request-handleRequest');
    switch (method) {
      case RPCMethodsBase.CHAIN_ID:
        return generateNormalResponse({ code: ResponseCode.SUCCESS, eventName, data: { test: null } });
      case RPCMethodsBase.SEND_TRANSACTION:
        return generateErrorResponse({ code: ResponseCode.UNIMPLEMENTED, eventName });
      default:
        return generateNormalResponse({ code: ResponseCode.SUCCESS, eventName });
    }
  };
}

export class CustomerTestBehaviour extends BaseProvider {
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
