export interface IRequestParams<T = any> {
  origin?: string;
  eventName: string;
  method: RPCMethods;
  payload?: T;
}

export interface RequestOption<T = any> {
  method: RPCMethods;
  payload?: T;
}

export interface PageMetaData {
  hostname: string;
  avatar?: string;
}

export interface IResponseType<T = any> {
  eventName: string;
  info: IResponseInfo<T>;
  origin?: string;
  target?: string;
}

export interface IResponseInfo<T = any> {
  code: ResponseCode;
  data?: T;
  msg?: string;
}

/**
 * Code values that under zero are unexpected.
 * Those above zero are some issues that your code may have to face
 */
export enum ResponseCode {
  SUCCESS = 0,

  ERROR_IN_PARAMS = -1,
  UNKNOWN_METHOD = -2,
  UNIMPLEMENTED = -3,
  UNAUTHENTICATED = -4,

  INTERNAL_ERROR = 1,
  TIMEOUT = 2,
  USER_DENIED = 3,
}

export type ResponseCodeType = keyof typeof ResponseCode;

export const ResponseMessagePreset: { [key in ResponseCodeType]: string } = {
  SUCCESS: 'Success',
  ERROR_IN_PARAMS: 'Please check your params.',
  UNKNOWN_METHOD: 'You are using an unknown method name, please check again.',
  UNIMPLEMENTED: 'This method is not implemented yet.',
  UNAUTHENTICATED: `You are not authenticated, use request({method:'accounts'}) first.`,
  INTERNAL_ERROR: 'Server internal error.',
  TIMEOUT: 'Request timeout.',
  USER_DENIED: 'User denied.',
};

export const RPCMethodsBase = {
  CHAIN_ID: 'chainId',
  ACCOUNTS: 'accounts',
  CHAIN_IDS: 'chainIds',
  CHAINS_INFO: 'chainsInfo',
  SEND_TRANSACTION: 'sendTransaction',
  REQUEST_ACCOUNTS: 'requestAccounts',
} as const;

export type RPCMethodsBaseType = (typeof RPCMethodsBase)[keyof typeof RPCMethodsBase];

export const RPCMethodsUnimplemented = {
  GET_PROVIDER_STATE: 'wallet_getProviderState',
  ADD_CHAIN: 'wallet_addEthereumChain',
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  REQUEST_PERMISSIONS: 'wallet_requestPermissions',
  GET_PERMISSIONS: 'wallet_getPermissions',
  NET_VERSION: 'net_version',
} as const;

export type RPCMethodsUnimplementedType = (typeof RPCMethodsUnimplemented)[keyof typeof RPCMethodsUnimplemented];

export type RPCMethods = RPCMethodsBaseType | RPCMethodsUnimplementedType;
