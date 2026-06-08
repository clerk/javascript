import React from 'react';

import { useCardState } from '@/elements/contexts';

import { useConfigureSSO } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { useWizard, type WizardStepConfig } from './elements/Wizard';
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
  const { connectionState: c, resetEpoch } = useConfigureSSO();

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

  // Keyed on `resetEpoch`: a reset bumps the epoch, remounting the wizard so its
  // `initialState` re-derives the furthest-reachable step for the now-no-
  // connection state. Create does NOT bump the epoch, so the create path keeps
  // its plain `goNext` (no remount, no create-flash).
  return (
    <Wizard
      key={resetEpoch}
      steps={steps}
    >
      <ResetCardErrorOnStepChange />
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

/**
 * Clears any card-level error whenever the active top-level step changes, so a
 * stale failure from one step doesn't leak into the next on a breadcrumb jump
 * or back-nav. This is a NAV-DRIVEN side-effect (a transition handler), not
 * state-sync to props — it reacts to `current` flipping, nothing else.
 *
 * NOTE (for review): kept as a minimal equivalent of the old sentinel. Without
 * it, a card error set on one step (e.g. the test step's "no successful run")
 * survives a breadcrumb jump to another step. Flagging it since it is the one
 * remaining wizard-level effect; if step bodies are made to own their own error
 * reset on entry this could be dropped.
 */
const ResetCardErrorOnStepChange = (): null => {
  const { current } = useWizard();
  const card = useCardState();
  const previousStepIdRef = React.useRef(current);

  React.useEffect(() => {
    if (previousStepIdRef.current === current) {
      return;
    }

    previousStepIdRef.current = current;
    card.setError(undefined);
  }, [current, card]);

  return null;
};
