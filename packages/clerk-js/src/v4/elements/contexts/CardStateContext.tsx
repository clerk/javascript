import React from 'react';

import { createContextAndHook } from '../../utils';

type Action = { type: 'block' | 'unblock' };

type CardState = {
  blocked: boolean;
};

type CardStateCtxValue = CardState & {
  dispatch: React.Dispatch<Action>;
};

const [CardStateCtx, useCardState] = createContextAndHook<CardStateCtxValue>('CardState');

const reducer = (state: CardState = { blocked: false }, action: Action): CardState => {
  switch (action.type) {
    case 'block':
      return { ...state, blocked: true };
    case 'unblock':
      return { ...state, blocked: false };
    default:
      return state;
  }
};

const CardStateProvider = (props: React.PropsWithChildren<any>) => {
  const [cardState, dispatch] = React.useReducer(reducer, { blocked: false });
  const value = React.useMemo(() => ({ value: { ...cardState, dispatch } }), [cardState]);
  return <CardStateCtx.Provider value={value}>{props.children}</CardStateCtx.Provider>;
};

export { useCardState, CardStateProvider };
export type { CardState };
