import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

export type ProfileConnectionModel = {
  requestKey: string;
  canRun: () => boolean;
  connect: (canContinue: () => boolean) => Promise<boolean>;
};

type PendingConnection = {
  promise: Promise<void>;
  release: () => void;
  timer?: ReturnType<typeof setTimeout>;
};

export const useProfileConnectionController = (model: ProfileConnectionModel, loadingKey: string) => {
  const card = useCardState();
  const pending = useRef<PendingConnection>();
  const mounted = useRef(true);
  const current = useRef({ key: model.requestKey });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey };
  }
  const owner = current.current;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const action = pending.current;
      if (action) {
        clearTimeout(action.timer);
        action.release();
        pending.current = undefined;
      }
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && current.current === owner && model.canRun();

  const connect = () => {
    if (!isCurrent()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current.promise;
    }
    const release = card.beginRequest(loadingKey);
    if (!release) {
      return Promise.resolve();
    }
    const action: PendingConnection = { release, promise: Promise.resolve() };
    pending.current = action;
    card.setError(undefined);
    action.promise = (async () => {
      try {
        const completed = await model.connect(isCurrent);
        if (completed && isCurrent()) {
          action.timer = setTimeout(() => {
            action.release();
            if (pending.current === action) {
              pending.current = undefined;
            }
          }, 2000);
        }
      } catch (error) {
        if (isCurrent()) {
          handleError(error as Error, [], card.setError);
        }
      } finally {
        if (action.timer === undefined) {
          action.release();
          if (pending.current === action) {
            pending.current = undefined;
          }
        }
      }
    })();
    return action.promise;
  };

  return {
    connect,
    isDisabled: card.isLoading,
    isLoading: card.loadingMetadata === loadingKey,
  };
};
