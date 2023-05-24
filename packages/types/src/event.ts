export enum CentralEthereumEvents {
  CONNECTED = 'connected',
  MESSAGE = 'message',
  DISCONNECTED = 'disconnected',
  ACCOUNT_CHANGED = 'accountChanged',
  CHAIN_CHANGED = 'chainChanged',
  ERROR = 'error',
}

export interface EventMessage {
  event: CentralEthereumEvents;
  params: any;
}

export interface EventResponse {
  eventName: string;
  data?: any;
  msg?: string;
}

export type DappEvents = CentralEthereumEvents;

export type EventId = string;
