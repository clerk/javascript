import type { LoadedClerk } from '@clerk/types';
import React from 'react';
import { assertContextExists } from 'ui/contexts/utils';

export type CoreClerkProps = LoadedClerk;

export const CoreClerkContext = React.createContext<LoadedClerk | undefined>(undefined);
CoreClerkContext.displayName = 'CoreClerkContext';

export function useCoreClerk(): CoreClerkProps {
  const context = React.useContext(CoreClerkContext);
  assertContextExists(context, 'CoreClerkContextProvider');
  return context;
}
