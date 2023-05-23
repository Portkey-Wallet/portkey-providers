import { RPCMethodsBase, RPCMethodsUnimplemented } from '@portkey/provider-types';

export function isRPCMethodsBase(method: string): method is RPCMethodsBase {
  return Object.values(RPCMethodsBase).indexOf(method as any) !== -1;
}

export function isRPCMethodsUnimplemented(method: string): method is RPCMethodsUnimplemented {
  return Object.values(RPCMethodsUnimplemented).indexOf(method as any) !== -1;
}
