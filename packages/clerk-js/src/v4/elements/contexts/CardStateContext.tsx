import React from 'react';

import { createContextAndHook } from '../../utils';

type Status = 'idle' | 'loading' | 'error';
type Metadata = string | undefined;
type CardStateCtxValue = {
  state: { status: Status; metadata: Metadata };
  setState: React.Dispatch<React.SetStateAction<{ status: Status; metadata: Metadata }>>;
};

const [CardStateCtx, _useCardState] = createContextAndHook<CardStateCtxValue>('CardState');

const CardStateProvider = (props: React.PropsWithChildren<any>) => {
  const [state, setState] = React.useState<{ status: Status; metadata: Metadata }>({
    status: 'idle',
    metadata: undefined,
  });

  const value = React.useMemo(() => ({ value: { state, setState } }), [state, setState]);
  return <CardStateCtx.Provider value={value}>{props.children}</CardStateCtx.Provider>;
};

const useCardState = () => {
  const { state, setState } = _useCardState();

  return {
    setIdle: (metadata?: Metadata) => setState({ status: 'idle', metadata }),
    setError: (metadata: Metadata) => setState({ status: 'error', metadata }),
    setLoading: (metadata?: Metadata) => setState({ status: 'loading', metadata }),
    loadingMetadata: state.status === 'loading' ? state.metadata : undefined,
    error: state.status === 'error' ? state.metadata : undefined,
    isLoading: state.status === 'loading',
    isIdle: state.status === 'idle',
  };
};

export { useCardState, CardStateProvider };
