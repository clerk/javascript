import { useEffect, useRef, useState } from 'react';

import { useLocalizations } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import type { useActivateStepModel } from './activate-step.model';

export const useActivateStepController = (model: ReturnType<typeof useActivateStepModel>) => {
  const card = useCardState();
  const { translateError } = useLocalizations();
  const latest = useRef({ model, card, translateError });
  latest.current = { model, card, translateError };
  const current = useRef({
    key: model.scopeKey,
    pending: undefined as Promise<void> | undefined,
    release: undefined as (() => void) | undefined,
    exited: false,
  });
  if (current.current.key !== model.scopeKey) {
    current.current = { key: model.scopeKey, pending: undefined, release: undefined, exited: false };
  }
  const owner = current.current;
  const mounted = useRef(true);
  const [failure, setFailure] = useState<{ owner: typeof owner; message: string | undefined }>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.pending = undefined;
      owner.release?.();
      owner.release = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();
  const exit = () => {
    if (!canRun() || owner.exited || owner.pending || latest.current.card.isLoading) {
      return;
    }
    owner.exited = true;
    latest.current.model.onExit?.();
  };
  const handleActivate = (): Promise<void> => {
    if (!canRun() || !latest.current.model.hasConnection || owner.exited) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return Promise.resolve();
    }
    owner.release = release;
    const ownsRequest = () => canRun() && owner.pending === action;
    setFailure(undefined);
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!ownsRequest()) {
          return;
        }
        const activated = await latest.current.model.activate(ownsRequest);
        if (activated && ownsRequest() && !owner.exited) {
          owner.exited = true;
          latest.current.model.onExit?.();
        }
      })
      .catch(error => {
        if (ownsRequest()) {
          handleError(error, [], error => setFailure({ owner, message: latest.current.translateError(error) }));
        }
      })
      .finally(() => {
        if (owner.pending === action) {
          owner.pending = undefined;
          owner.release = undefined;
        }
        release();
      });
    owner.pending = action;
    return action;
  };
  return {
    error: failure?.owner === owner ? failure.message : undefined,
    isLoading: card.isLoading,
    handleActivate,
    onExit: model.onExit ? exit : undefined,
  };
};
