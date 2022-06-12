import React from 'react';

import { createContextAndHook } from '../../utils';

type Action = { type: 'setLoading'; isLoading: boolean } | { type: 'setError'; error: string | undefined };

type CardState = {
  isLoading: boolean;
  error: string | undefined;
};

type CardStateCtxValue = CardState & {
  setLoading: () => void;
  setIdle: () => void;
  setError: (error: string | undefined) => void;
};

const [CardStateCtx, useCardState] = createContextAndHook<CardStateCtxValue>('CardState');

const initState: CardState = {
  isLoading: false,
  error: undefined,
};

const reducer = (state: CardState, action: Action): CardState => {
  switch (action.type) {
    case 'setLoading':
      return { ...state, isLoading: action.isLoading };
    case 'setError':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

const CardStateProvider = (props: React.PropsWithChildren<any>) => {
  const [cardState, dispatch] = React.useReducer(reducer, initState);

  const value = React.useMemo(() => {
    const setLoading = () => dispatch({ type: 'setLoading', isLoading: true });
    const setIdle = () => dispatch({ type: 'setLoading', isLoading: false });
    const setError = (error: string | undefined) => {
      dispatch({ type: 'setError', error });
    };

    return { value: { ...cardState, setIdle, setLoading, setError } };
  }, [cardState]);

  return <CardStateCtx.Provider value={value}>{props.children}</CardStateCtx.Provider>;
};

export { useCardState, CardStateProvider };
export type { CardState };
