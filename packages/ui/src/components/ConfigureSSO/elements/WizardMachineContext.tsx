import React from 'react';

import type { Machine } from './useMachine';

/**
 * Provides the top-level ConfigureSSO state machine (`current` + `dispatch`)
 * to the steps, footer, and header.
 *
 * This is a SIBLING to `ConfigureSSOContext` rather than an extension of it so
 * the machine — which the cutover introduces — stays cleanly separable from the
 * server-state/mutations context. Both providers are mounted at the SAME level
 * (no inner provider): `ConfigureSSOSteps` renders `WizardMachineProvider`
 * directly inside `ConfigureSSOProvider`, and the loading gate stays one level
 * above both (in `ConfigureSSOContent`).
 *
 * Steps stop owning routing: instead of `useWizard().goNext/goToStep`, the
 * simple top-level steps read `useWizardMachine().dispatch` (directly or via
 * `Step.Footer.Submit` -> `useSubmitRunner`).
 */
const WizardMachineContext = React.createContext<Machine | null>(null);
WizardMachineContext.displayName = 'WizardMachineContext';

export const WizardMachineProvider = ({
  machine,
  children,
}: React.PropsWithChildren<{ machine: Machine }>): JSX.Element => (
  <WizardMachineContext.Provider value={machine}>{children}</WizardMachineContext.Provider>
);

export const useWizardMachine = (): Machine => {
  const ctx = React.useContext(WizardMachineContext);
  if (!ctx) {
    throw new Error('useWizardMachine called outside <WizardMachineProvider>.');
  }
  return ctx;
};
