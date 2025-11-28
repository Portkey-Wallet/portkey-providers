export interface BaseInternalMessagePayload {
  from: string;
  hostname: string;
  href: string;
  method: string;
  origin: string;
}

export interface InternalMessagePayload extends BaseInternalMessagePayload {
  params: any;
}

export interface InternalMessageData {
  type: string;
  payload: any;
}
