import React from 'react';
import type { PollerCallback, PollerStop } from '../utils/poller';
import { Poller } from '../utils/poller';

export function usePoller(
  cb: PollerCallback,
  delayInMs: number,
): { stop: PollerStop } {
  const cbRef = React.useRef<PollerCallback>();
  const pollerRef = React.useRef(Poller({ delayInMs }));
  const { run, stop } = pollerRef.current;

  React.useEffect(() => {
    cbRef.current = cb;
    void run(cb);
    return stop;
  }, []);

  return { stop };
}
