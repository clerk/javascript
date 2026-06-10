import React from 'react';

import type { WizardContextValue } from './types';

export const WizardContext = React.createContext<WizardContextValue | null>(null);
WizardContext.displayName = 'WizardContext';

/**
 * The wizard navigation facade. Consumers (step bodies, footers, the
 * breadcrumb) read only this — `goNext`/`goPrev`/`goToStep` plus the derived
 * `current`/`activeSteps`/`isFirstStep`/`isLastStep`. The underlying state
 * machine is an internal detail of `<Wizard>` and is never exposed.
 */
export function useWizard(): WizardContextValue {
  const ctx = React.useContext(WizardContext);

  if (!ctx) {
    throw new Error('useWizard called outside of <Wizard>');
  }

  return ctx;
}
