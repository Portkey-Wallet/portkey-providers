export interface IDappRequestWrapper {
  eventId: string;
  params: IDappRequestArguments;
}

export interface IDappRequestArguments {
  method: RPCMethods;
  payload?: any;
}

export interface PageMetaData {
  hostname: string;
  avatar?: string;
}

export interface IDappResponseWrapper {
  eventId: string;
  params: IDappRequestResponse;
}

export interface IResponseType<T = any> {
  eventName: string;
  info: IDappRequestResponse<T>;
  origin?: string;
  target?: string;
}

export interface IDappRequestResponse<T = any> {
  code: ResponseCode;
  data?: T;
  msg?: string;
}

export enum ResponseCode {
  ERROR_IN_PARAMS = -1,
  UNKNOWN_METHOD = -2,
  UNIMPLEMENTED = -3,
  UNAUTHENTICATED = -4,
  SUCCESS = 0,
  INTERNAL_ERROR = 1,
  TIMEOUT = 2,
  USER_DENIED = 3,
}

export type ResponseCodeType = keyof typeof ResponseCode;

export const ResponseMessagePreset: { [key in ResponseCodeType]: string } = {
  SUCCESS: 'success',
  ERROR_IN_PARAMS: 'please check your params.',
  UNKNOWN_METHOD: 'you are using an unknown method name, please check again.',
  UNIMPLEMENTED: 'this method is not implemented yet.',
  UNAUTHENTICATED: `you are not authenticated, use request({method:'accounts'}) first.`,
  INTERNAL_ERROR: 'server internal error.',
  TIMEOUT: 'request timeout.',
  USER_DENIED: 'user denied.',
};

export const RPCMethodsBase = {
  ACCOUNTS: 'accounts',
  REQUEST_ACCOUNTS: 'requestAccounts',
  DECRYPT: 'decrypt',
  CHAIN_ID: 'chainId',
  GET_PUBLIC_KEY: 'getEncryptionPublicKey',
  SEND_TRANSACTION: 'sendTransaction',
} as const;

export const RPCMethodsUnimplemented = {
  GET_PROVIDER_STATE: 'wallet_getProviderState',
  ADD_CHAIN: 'wallet_addEthereumChain',
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  REQUEST_PERMISSIONS: 'wallet_requestPermissions',
  GET_PERMISSIONS: 'wallet_getPermissions',
  NET_VERSION: 'net_version',
} as const;

export type RPCMethods =
  | (typeof RPCMethodsBase)[keyof typeof RPCMethodsBase]
  | (typeof RPCMethodsUnimplemented)[keyof typeof RPCMethodsUnimplemented];
