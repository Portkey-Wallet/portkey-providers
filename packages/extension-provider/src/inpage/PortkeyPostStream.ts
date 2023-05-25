import { DappInteractionStream } from '@portkey/providers';
const noop = () => undefined;
export class PortkeyPostStream extends DappInteractionStream {
  _read = noop;

  _write = function (msg: unknown, _encoding: BufferEncoding, cb: (error?: Error | null) => void) {
    try {
      if (Buffer.isBuffer(msg)) {
        const data: any = msg.toJSON();
        data._isBuffer = true;
        window.postMessage(JSON.stringify({ ...data, origin: window.location.href }));
      } else {
        const data = typeof msg === 'object' ? msg : { data: msg };
        window.postMessage(JSON.stringify({ ...data, origin: window.location.href }));
      }
    } catch (err) {
      return cb(new Error('WindowPostMessageStream - disconnected'));
    }
    return cb();
  };
}
