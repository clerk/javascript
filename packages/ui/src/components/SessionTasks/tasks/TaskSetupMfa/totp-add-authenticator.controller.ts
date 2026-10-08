import { useEffect, useReducer, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import type { TotpCreationModel } from './totp-code-flow.types';

type TotpData = { uri?: string; secret?: string };
type State = { totp?: TotpData; displayFormat: 'qr' | 'uri' };
type Event = { type: 'created'; totp: TotpData } | { type: 'show-uri' } | { type: 'show-qr' };

const reducer = (state: State, event: Event): State => {
  switch (event.type) {
    case 'created':
      return { ...state, totp: event.totp };
    case 'show-uri':
      return { ...state, displayFormat: 'uri' };
    case 'show-qr':
      return { ...state, displayFormat: 'qr' };
  }
};

export const useTotpAddAuthenticatorController = (
  model: TotpCreationModel,
  onSuccess: () => void,
  onReset: () => void,
) => {
  const card = useCardState();
  const [state, dispatch] = useReducer(reducer, { displayFormat: 'qr' });
  const latest = useRef({ model, onSuccess, onReset, card });
  latest.current = { model, onSuccess, onReset, card };
  const scopeKey = useRef(model.scopeKey);
  const mounted = useRef(true);
  const finished = useRef(false);
  const pending = useRef<Promise<void>>();
  const canRun = () =>
    mounted.current &&
    !finished.current &&
    latest.current.model.scopeKey === scopeKey.current &&
    latest.current.model.canRun();
  const start = () => {
    if (!canRun() || !latest.current.model.canCreate || pending.current) {
      return;
    }
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!canRun()) {
          return;
        }
        try {
          const result = await latest.current.model.create(canRun);
          if (!canRun()) {
            return;
          }
          if (result.status === 'cancelled') {
            finished.current = true;
            latest.current.onReset();
          } else if (result.status === 'created') {
            dispatch({ type: 'created', totp: result.totp });
          }
        } catch (error) {
          if (canRun()) {
            handleError(error as Error, [], latest.current.card.setError);
          }
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
        }
      });
    pending.current = action;
  };
  const initialStart = useRef(start);
  useEffect(() => {
    mounted.current = true;
    initialStart.current();
    return () => {
      mounted.current = false;
    };
  }, []);
  const exit = (action: () => void) => {
    if (canRun() && !pending.current && state.totp) {
      finished.current = true;
      action();
    }
  };
  return {
    totp: state.totp,
    displayFormat: state.displayFormat,
    showURI: () => {
      if (canRun()) {
        dispatch({ type: 'show-uri' });
      }
    },
    showQR: () => {
      if (canRun()) {
        dispatch({ type: 'show-qr' });
      }
    },
    onSuccess: () => exit(latest.current.onSuccess),
    onReset: () => exit(latest.current.onReset),
  };
};
