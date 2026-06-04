import React from 'react';

import type { WizardContextValue } from './types';

export const WizardContext = React.createContext<WizardContextValue | null>(null);
WizardContext.displayName = 'WizardContext';

export function useWizard(): WizardContextValue {
  const ctx = React.useContext(WizardContext);

  if (!ctx) {
    throw new Error('useWizard called outside of <Wizard>');
  }

  return ctx;
}
