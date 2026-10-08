import { useEffect, useReducer, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

export type AcceptanceState<T> = { status: 'idle' } | { status: 'pending' } | { status: 'accepted'; value: T };
type AcceptanceEvent<T> = { type: 'ACCEPT' } | { type: 'RESOLVE'; value: T } | { type: 'REJECT' };

const transition = <T>(state: AcceptanceState<T>, event: AcceptanceEvent<T>): AcceptanceState<T> => {
  switch (event.type) {
    case 'ACCEPT':
      return { status: 'pending' };
    case 'RESOLVE':
      return { status: 'accepted', value: event.value };
    case 'REJECT':
      return { status: 'idle' };
    default:
      return state;
  }
};

export type InvitationAcceptanceController<T> = {
  state: AcceptanceState<T>;
  isLoading: boolean;
  onAccept: () => Promise<void>;
};

export const useInvitationAcceptanceController = <T>(accept: () => Promise<T>): InvitationAcceptanceController<T> => {
  const card = useCardState();
  const [state, send] = useReducer(transition<T>, { status: 'idle' });
  const pendingAccept = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);
  const releaseRequest = useRef<(() => void) | undefined>();
  const latest = useRef({ card, accept });
  latest.current = { card, accept };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pendingAccept.current) {
        pendingAccept.current = null;
        releaseRequest.current?.();
        releaseRequest.current = undefined;
      }
    };
  }, []);

  const onAccept = () => {
    if (!mounted.current) {
      return Promise.resolve();
    }
    if (pendingAccept.current) {
      return pendingAccept.current;
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return Promise.resolve();
    }
    releaseRequest.current = release;
    latest.current.card.setError(undefined);
    send({ type: 'ACCEPT' });
    const ownsRequest = () => mounted.current && pendingAccept.current === action;
    const action = (async () => latest.current.accept())()
      .then(value => {
        if (ownsRequest()) {
          send({ type: 'RESOLVE', value });
        }
      })
      .catch(error => {
        if (ownsRequest()) {
          send({ type: 'REJECT' });
          handleError(error, [], latest.current.card.setError);
        }
      })
      .finally(() => {
        if (ownsRequest()) {
          pendingAccept.current = null;
          releaseRequest.current = undefined;
        }
        release();
      });
    pendingAccept.current = action;
    return action;
  };

  return { state, isLoading: card.isLoading, onAccept };
};
