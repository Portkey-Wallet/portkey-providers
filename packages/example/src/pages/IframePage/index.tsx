import { ContentPostStream } from '@portkey/iframe-provider';
import React, { useCallback, useEffect } from 'react';
let pageStream: ContentPostStream;

export default function IframePage() {
  const onSend = useCallback((data?: any) => {
    pageStream.send({
      eventName: 'sendMessage',
      info: {
        code: 0,
        data: data ? data : 'sendMessage',
      },
      // target: string;
    });
  }, []);
  useEffect(() => {
    pageStream = new ContentPostStream({ name: 'CONTENT_TARGET' });

    pageStream.on('data', (data: Buffer) => {
      const params = JSON.parse(data.toString());
      console.log('IframePage----onData', params);
      onSend(params);
    });
  }, []);

  return (
    <div>
      <button onClick={() => onSend()}>send</button>
    </div>
  );
}
