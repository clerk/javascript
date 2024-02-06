import { fromCallback } from 'xstate';

import type { RouterSyncEvent } from './types';

export const historySyncListener = fromCallback(({ sendBack }) => {
  const historyHandler = () => sendBack({ type: 'sync' } satisfies RouterSyncEvent);

  window.addEventListener('popstate', historyHandler);

  const removeListener = () => window.removeEventListener('popstate', historyHandler);

  return () => removeListener();
});
