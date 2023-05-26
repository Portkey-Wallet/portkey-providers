import { PortkeyPortStream } from '@portkey/providers';

export class ContentStream extends PortkeyPortStream {
  _onMessage(event: any): void {
    try {
      const msg = event.data;
      if (typeof msg !== 'string') return;
      const data = JSON.parse(msg);
      // validate message
      if (!data || typeof data !== 'object') return;

      // if (this.origin !== '*' && data.origin && data.origin !== this.origin) return;

      // mark stream push message
      // if (data.target && data.target !== this.name) return;

      if (!data.payload || typeof data.payload !== 'object') return;

      this.push(msg);
    } catch (error) {
      console.log(error, 'Portkey send message error');
    }
  }
}
