export const NotificationEvents = {
  CONNECTED: 'connected',
  MESSAGE: 'message',
  DISCONNECTED: 'disconnected',
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  ERROR: 'error',
} as const;

export interface EventMessage {
  event: DappEvents;
  params: any;
}

export interface EventResponse<T = any> {
  eventName: string;
  data?: T;
  msg?: string;
}

export type DappEvents = (typeof NotificationEvents)[keyof typeof NotificationEvents];

export type EventId = string;
