export const NotificationEvents = {
  CONNECTED: 'connected',
  MESSAGE: 'message',
  DISCONNECTED: 'disconnected',
  ACCOUNTS_CHANGED: 'accountsChanged',
  NETWORK_CHANGED: 'networkChanged',
  CHAIN_CHANGED: 'chainChanged',
  ERROR: 'error',
} as const;

export interface EventResponse<T = any> {
  eventName: string;
  data?: T;
  msg?: string;
}

export type DappEvents = (typeof NotificationEvents)[keyof typeof NotificationEvents];

export type EventId = string;
