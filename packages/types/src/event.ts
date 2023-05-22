export enum CentralEthereumEvents {
  CONNECTED = 'connected',
  MESSAGE = 'message',
  DISCONNECTED = 'disconnected',
  ACCOUNT_CHANGED = 'accountChanged',
  CHAIN_CHANGED = 'chainChanged',
  ERROR = 'error',
}

export type DappEvents = CentralEthereumEvents;

export type EventId = string;

export type EventResponse = any;
