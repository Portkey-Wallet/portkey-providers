import {
  MethodsBaseType,
  MethodsBase,
  MethodsUnimplemented,
  MethodsUnimplementedType,
  DappEvents,
  NotificationEvents,
} from '@portkey/provider-types';

/**
 * get page's host name
 * @param url page url like ```https://www.portkey.finance/mock?name=portkey&age=1```
 * @returns {string} host name like ```https://www.portkey.finance```, ignore the rest of url
 */
export const getHostName = (url: string): string => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;
  return regex.test(url)
    ? regex.exec(url)?.reduce((acc, cur, index) => acc + (index === 1 || index === 2 ? cur : ''), '') ?? 'unknown'
    : 'unknown';
};

export function isMethodsBase(method: string): method is MethodsBaseType {
  return Object.values(MethodsBase).indexOf(method as any) !== -1;
}

export function isMethodsUnimplemented(method: string): method is MethodsUnimplementedType {
  return Object.values(MethodsUnimplemented).indexOf(method as any) !== -1;
}

export function isNotificationEvents(eventName: string): eventName is DappEvents {
  return Object.values(NotificationEvents).indexOf(eventName as any) !== -1;
}
