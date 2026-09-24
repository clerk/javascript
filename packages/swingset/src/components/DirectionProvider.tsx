'use client';

import * as React from 'react';

export type Direction = 'ltr' | 'rtl';

interface DirectionContextValue {
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

const DirectionContext = React.createContext<DirectionContextValue>({ direction: 'ltr', setDirection: () => {} });

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = React.useState<Direction>('ltr');
  React.useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);
  const value = React.useMemo(() => ({ direction, setDirection }), [direction]);
  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

export function useDirection() {
  return React.useContext(DirectionContext);
}
