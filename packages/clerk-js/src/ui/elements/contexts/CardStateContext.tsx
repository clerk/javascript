import React from 'react';

import { useSafeState } from '../../hooks';
import { createContextAndHook } from '../../utils';

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

  return {
    setIdle: (metadata?: Metadata) => setState(s => ({ ...s, status: 'idle', metadata })),
    setError: (metadata: Metadata) => setState(s => ({ ...s, error: metadata })),
    setLoading: (metadata?: Metadata) => setState(s => ({ ...s, status: 'loading', metadata })),
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
        <Component {...props} />
      </CardStateProvider>
    );
  };
};
