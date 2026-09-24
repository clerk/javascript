import React from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HeadingLevelContext = React.createContext<HeadingLevel>(2);

const nextLevel = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6 } as const satisfies Record<HeadingLevel, HeadingLevel>;

export interface HeadingLevelProviderProps {
  level?: HeadingLevel;
  children?: React.ReactNode;
}

export function HeadingLevelProvider({ level, children }: HeadingLevelProviderProps) {
  const parent = React.useContext(HeadingLevelContext);
  return <HeadingLevelContext.Provider value={level ?? nextLevel[parent]}>{children}</HeadingLevelContext.Provider>;
}

export function useHeadingLevel(): HeadingLevel {
  return React.useContext(HeadingLevelContext);
}
