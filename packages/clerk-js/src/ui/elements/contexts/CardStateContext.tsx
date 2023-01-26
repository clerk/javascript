import { createContextAndHook } from '@clerk/shared';
import type { ClerkAPIError } from '@clerk/types';
import React from 'react';

import { useLocalizations } from '../../customizables';
import { useSafeState } from '../../hooks';

type Status = 'idle' | 'loading' | 'error';
type Metadata = string | undefined;
type State = { status: Status; metadata: Metadata; error: string | undefined };
type CardStateCtxValue = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
};

const [CardStateCtx, _useCardState] = createContextAndHook<CardStateCtxValue>('CardState');

const CardStateProvider = (props: React.PropsWithChildren<any>) => {
  const [state, setState] = useSafeState<State>({
    status: 'idle',
    metadata: undefined,
    error: undefined,
  });

  const value = React.useMemo(() => ({ value: { state, setState } }), [state, setState]);
  return <CardStateCtx.Provider value={value}>{props.children}</CardStateCtx.Provider>;
};

const useCardState = () => {
  const { state, setState } = _useCardState();
  const { translateError } = useLocalizations();

  const setIdle = (metadata?: Metadata) => setState(s => ({ ...s, status: 'idle', metadata }));
  const setError = (metadata: ClerkAPIError | Metadata) => setState(s => ({ ...s, error: translateError(metadata) }));
  const setLoading = (metadata?: Metadata) => setState(s => ({ ...s, status: 'loading', metadata }));
  const runAsync = async (cb: Promise<unknown> | (() => Promise<unknown>)) => {
    setLoading();
    return (typeof cb === 'function' ? cb() : cb)
      .then(res => {
        return res;
      })
      .finally(() => setIdle());
  };

  return {
    setIdle,
    setError,
    setLoading,
    runAsync,
    loadingMetadata: state.status === 'loading' ? state.metadata : undefined,
    error: state.error ? state.error : undefined,
    isLoading: state.status === 'loading',
    isIdle: state.status === 'idle',
  };
};

export { useCardState, CardStateProvider };

export const withCardStateProvider = <T,>(Component: React.ComponentType<T>) => {
  return (props: T) => {
    return (
      <CardStateProvider>
        {/* @ts-expect-error */}
        <Component {...props} />
      </CardStateProvider>
    );
  };
};
