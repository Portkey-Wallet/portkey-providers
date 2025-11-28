import { ResponseCode, ResponseMessagePreset, ResponseCodeType, IResponseType } from '@portkey/provider-types';

export function generateErrorResponse({
  code,
  msg,
  origin,
  target,
  eventName,
  ...params
}: {
  code: ResponseCode;
  msg?: string;
} & Omit<IResponseType, 'info'>): IResponseType {
  return generateResponse({
    info: {
      code,
      msg: msg && msg.length > 0 ? msg : ResponseMessagePreset[ResponseCode[code] as ResponseCodeType],
    },
    origin,
    target,
    eventName,
    ...params,
  });
}

export function generateNormalResponse({
  data,
  code,
  origin,
  target,
  eventName,
  ...params
}: {
  data?: any;
  code?: ResponseCode;
} & Omit<IResponseType, 'info'>) {
  return generateResponse({
    info: {
      data,
      code: code ?? ResponseCode.SUCCESS,
    },
    origin,
    target,
    eventName,
    ...params,
  });
}

export function generateResponse(params: IResponseType): IResponseType {
  return params;
}
