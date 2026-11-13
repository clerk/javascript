'use client';

import type { ReactNode } from 'react';
import React from 'react';

export type TextDirection = 'ltr' | 'rtl';

export interface DirectionProviderProps {
  /** The reading direction that keyboard navigation follows below this provider. Defaults to `ltr`. */
  direction?: TextDirection;
  children: ReactNode;
}

const DirectionContext = React.createContext<TextDirection | undefined>(undefined);

export function DirectionProvider({ direction = 'ltr', children }: DirectionProviderProps): React.ReactElement {
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
}

export function useDirection(): TextDirection {
  return React.useContext(DirectionContext) ?? 'ltr';
}

export function readingDirectionKeys(direction: TextDirection) {
  return {
    previousKey: direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft',
    nextKey: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
  };
}
