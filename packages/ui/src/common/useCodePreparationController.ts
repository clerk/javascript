import { useCallback, useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { CodePreparationCommands } from './code-verification.types';

export const useCodePreparationController = (model: CodePreparationCommands, onPrepared?: () => void) => {
  const { setError } = useCardState();
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const mounted = useRef(true);
  const pending = useRef<object>();
  const attempted = useRef<number>();
  const latest = useRef({ model, setError, onPrepared });
  latest.current = { model, setError, onPrepared };
  const { canRun } = model;
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && canRun(),
    [version, canRun],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const runRequest = useCallback(
    async (request: () => Promise<void>) => {
      if (!isCurrent() || pending.current) {
        return;
      }
      const token = {};
      pending.current = token;
      try {
        await request();
      } catch (error) {
        if (error && isCurrent() && pending.current === token) {
          handleError(error as Error, [], latest.current.setError);
        }
      } finally {
        if (pending.current === token) {
          pending.current = undefined;
        }
      }
    },
    [isCurrent],
  );
  const prepare = useCallback(async () => {
    if (!latest.current.model.shouldAvoidPrepare) {
      await runRequest(async () => {
        await latest.current.model.prepareRequest();
        if (isCurrent()) {
          latest.current.onPrepared?.();
        }
      });
    }
  }, [runRequest, isCurrent]);
  useEffect(() => {
    if (model.shouldAvoidInitialPrepare || attempted.current === version) {
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (active && isCurrent() && attempted.current !== version) {
        attempted.current = version;
        void prepare();
      }
    });
    return () => {
      active = false;
    };
  }, [model.shouldAvoidInitialPrepare, version, isCurrent, prepare]);
  return { prepare, runRequest, canRun: isCurrent };
};
