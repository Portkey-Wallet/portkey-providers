/**
 * get page's host name
 * @param url page url like ```https://www.portkey.finance/mock?name=portkey&age=1```
 * @returns {string} host name like ```https://www.portkey.finance```, ingore the rest of url
 */
export const getHostName = (url: string): string => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;
  return regex.test(url)
    ? regex.exec(url)?.reduce((acc, cur, index) => acc + (index === 1 || index === 2 ? cur : ''), '') ?? 'unknown'
    : 'unknown';
};
import { RPCMethodsBase, RPCMethodsUnimplemented } from '@portkey/provider-types';

export function isRPCMethodsBase(method: string): method is RPCMethodsBase {
  return Object.values(RPCMethodsBase).indexOf(method as any) !== -1;
}

export function isRPCMethodsUnimplemented(method: string): method is RPCMethodsUnimplemented {
  return Object.values(RPCMethodsUnimplemented).indexOf(method as any) !== -1;
}
