import { test } from '@jest/globals';
import { expect } from '@jest/globals';
import { describe } from 'node:test';
import { generateErrorResponse, generateNormalResponse } from '../src/response';
import { IResponseType, ResponseCode, ResponseMessagePreset } from '@portkey/provider-types';
describe('generate response quick function', () => {
  test('generateErrorResponse', () => {
    expect(generateErrorResponse({ code: ResponseCode.ERROR_IN_PARAMS, eventName: 'mock' })).toEqual({
      eventName: 'mock',
      info: { code: ResponseCode.ERROR_IN_PARAMS, msg: ResponseMessagePreset.ERROR_IN_PARAMS },
    } as IResponseType);
    expect(generateErrorResponse({ code: ResponseCode.ERROR_IN_PARAMS, eventName: 'mock', msg: '42' })).toEqual({
      eventName: 'mock',
      info: { code: ResponseCode.ERROR_IN_PARAMS, msg: '42' },
    } as IResponseType);
  });
  test('generateNormalResponse', () => {
    expect(generateNormalResponse({ code: ResponseCode.SUCCESS, eventName: 'mock' })).toEqual({
      eventName: 'mock',
      info: { code: ResponseCode.SUCCESS },
    } as IResponseType);
  });
  expect(generateNormalResponse({ eventName: 'mock' })).toEqual({
    eventName: 'mock',
    info: { code: ResponseCode.SUCCESS },
  } as IResponseType);
});
