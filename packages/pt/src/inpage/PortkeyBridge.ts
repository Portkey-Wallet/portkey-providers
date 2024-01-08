import { RequestOption } from '@portkey/provider-types';
import { BridgeMethodsBase, IPortkeyBridge, ShareOptions } from './types';
import { BaseBridge } from './BaseBridge';

export class PortkeyBridge extends BaseBridge implements IPortkeyBridge {
  showShareMenu(options: ShareOptions): Promise<void> {
    return this.request<void>({ method: BridgeMethodsBase.SHOW_SHARE_MENU, payload: options } as RequestOption);
  }
}
