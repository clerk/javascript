import React from 'react';

import { parseVariables } from './parseVariables';
import { defaultMosaicTokens } from './tokens';
import type { MosaicTheme, MosaicVariables } from './tokens';

const MosaicThemeContext = React.createContext<MosaicTheme | null>(null);

export interface MosaicProviderProps {
  children: React.ReactNode;
  variables?: MosaicVariables;
}

export function MosaicProvider({ children, variables }: MosaicProviderProps) {
  const theme = React.useMemo(() => parseVariables(defaultMosaicTokens, variables), [variables]);
  return <MosaicThemeContext.Provider value={theme}>{children}</MosaicThemeContext.Provider>;
}

export function useMosaicTheme(): MosaicTheme {
  const theme = React.useContext(MosaicThemeContext);
  if (!theme) {
    throw new Error('useMosaicTheme must be used within a MosaicProvider');
  }
  return theme;
}
