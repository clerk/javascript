import React from 'react';

import { useCardState } from '@/elements/contexts';

import { useConfigureSSO } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { type WizardStepConfig } from './elements/Wizard';
import { Wizard } from './elements/Wizard';
import { ConfigureStep, ConfirmationStep, SelectProviderStep, TestConfigurationStep, VerifyDomainStep } from './steps';

/**
 * The ConfigureSSO step graph the generic entry-guard `<Wizard>` derives its
 * machine from. Order is array order; each step's inline `guard` is an *entry
 * precondition* — "may navigation land here right now?" — so the furthest step
 * a contiguous run of holding guards reaches is where the wizard mounts, and
 * the breadcrumb gates jumps to the same predicate.
 *
 * `verify-domain` is the entry step (no guard ⇒ always reachable).
 * `select-provider` carries no `label`, so it is off the breadcrumb while still
 * a real navigable position (it replaces the old `hidden` provider step).
 *
 * Guards are intentionally monotonic across the order: a later guard holding
 * implies every earlier one does, which is what the furthest-reachable init and
 * positional back-navigation rely on. An active connection counts configure +
 * test satisfied, so a live connection short-circuits straight to confirmation.
 */
export const ConfigureSSOSteps = (): JSX.Element => {
  const { connectionState: c } = useConfigureSSO();
  const card = useCardState();

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Verify domain' },
      { id: 'select-provider', guard: () => c.isPrimaryEmailVerified },
      { id: 'configure', label: 'Configure', guard: () => c.isPrimaryEmailVerified && c.hasConnection },
      { id: 'test', label: 'Test', guard: () => c.hasMinimumConfiguration || c.isActive },
      { id: 'confirmation', label: 'Confirmation', guard: () => c.hasSuccessfulTestRun || c.isActive },
    ],
    [c],
  );

  // Reset does NOT remount the wizard. Deleting the connection breaks the active
  // step's entry guard, and the machine self-corrects in its render phase,
  // re-seating to the furthest-reachable step (the same `initialState`
  // derivation it uses on mount) — no key, no remount, no create-flash.
  //
  // `onStepChange` clears any card-level error whenever the active top-level step
  // actually changes, so a stale failure from one step doesn't leak into the next
  // on a breadcrumb jump or back-nav. The wizard fires it from its dispatch
  // handler — no wizard-level `useEffect` involved.
  return (
    <Wizard
      steps={steps}
      onStepChange={() => card.setError(undefined)}
    >
      <ConfigureSSOHeader />

      <Wizard.Match id='verify-domain'>
        <VerifyDomainStep />
      </Wizard.Match>

      <Wizard.Match id='select-provider'>
        <SelectProviderStep />
      </Wizard.Match>

      <Wizard.Match id='configure'>
        <ConfigureStep />
      </Wizard.Match>

      <Wizard.Match id='test'>
        <TestConfigurationStep />
      </Wizard.Match>

      <Wizard.Match id='confirmation'>
        <ConfirmationStep />
      </Wizard.Match>
    </Wizard>
  );
};
