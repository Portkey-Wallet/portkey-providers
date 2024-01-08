export type ShareOptions = {
  message: string;
  url?: string; // iOS only
  title?: string; // android only
};
export interface IPortkeyBridge {
  showShareMenu(options: ShareOptions): Promise<void>; // share
}

export const BridgeMethodsBase = {
  SHOW_SHARE_MENU: 'bridge_showShareMenu',
} as const;
