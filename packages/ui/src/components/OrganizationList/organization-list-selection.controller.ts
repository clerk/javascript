import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

export const useOrganizationListSelectionController = (
  select: ((canContinue?: () => boolean) => Promise<void>) | undefined,
  getUnauthorizedError?: () => string,
  options?: { requestKey: string; canRun: () => boolean },
): (() => Promise<void>) => {
  const card = useCardState();
  const latest = useRef({ card, select, getUnauthorizedError, options });
  latest.current = { card, select, getUnauthorizedError, options };
  const current = useRef({
    key: options?.requestKey,
    generation: {},
    pending: undefined as Promise<void> | undefined,
    release: undefined as (() => void) | undefined,
  });
  if (current.current.key !== options?.requestKey) {
    current.current = { key: options?.requestKey, generation: {}, pending: undefined, release: undefined };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
      owner.release?.();
      owner.release = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.options?.canRun?.() !== false;

  return () => {
    if (!canRun() || !latest.current.select) {
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
    const origin = owner.generation;
    const ownsRequest = () => canRun() && owner.generation === origin;
    const source = latest.current.select;
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(() => {
        if (ownsRequest()) {
          return source(ownsRequest);
        }
        return;
      })
      .catch(error => {
        if (!ownsRequest()) {
          return;
        }
        const code = isClerkAPIResponseError(error) ? error.errors?.[0]?.code : undefined;
        const getError = latest.current.getUnauthorizedError;
        if (
          getError &&
          (code === 'organization_not_found_or_unauthorized' || code === 'not_a_member_in_organization')
        ) {
          latest.current.card.setError(getError());
        } else {
          handleError(error, [], latest.current.card.setError);
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
};
