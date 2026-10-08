import { useEffect, useRef, useState } from 'react';

import { handleError } from '@/utils/errorHandler';

export const useSyncNowRowController = (
  onSync: () => Promise<void>,
  onSynced: () => void,
  syncFailedMessage: string,
  { requestKey, canRun }: { requestKey: string; canRun: () => boolean },
) => {
  const mounted = useRef(false);
  const pending = useRef<object | null>(null);
  const scope = useRef({ key: requestKey, version: 0 });
  if (scope.current.key !== requestKey) {
    scope.current = { key: requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const [state, setState] = useState<{ version: number; isSyncing: boolean; error: string | undefined }>({
    version,
    isSyncing: false,
    error: undefined,
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, [requestKey]);
  const isScopeCurrent = () => mounted.current && scope.current.version === version;
  const isCurrent = () => isScopeCurrent() && canRun();

  const run = async (): Promise<void> => {
    if (!isCurrent() || pending.current) {
      return;
    }
    const request = {};
    pending.current = request;
    setState({ version, isSyncing: true, error: undefined });
    try {
      await onSync();
      if (isCurrent() && pending.current === request) {
        onSynced();
      }
    } catch (err) {
      if (!isCurrent() || pending.current !== request) {
        return;
      }
      let error: string | undefined;
      try {
        handleError(err as Error, [], message => {
          error =
            typeof message === 'string'
              ? message
              : message && (('longMessage' in message && message.longMessage) || message.message);
        });
      } catch {
        error = syncFailedMessage;
      }
      setState({ version, isSyncing: false, error });
    } finally {
      if (pending.current === request) {
        pending.current = null;
        if (isScopeCurrent()) {
          setState(current => ({ ...current, isSyncing: false }));
        }
      }
    }
  };

  return {
    isSyncing: state.version === version && state.isSyncing,
    error: state.version === version ? state.error : undefined,
    run,
  };
};
