import React from 'react';

import { useCardState } from '@/elements/contexts';

import { useConfigureSSO } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { type WizardStepConfig } from './elements/Wizard';
import { Wizard } from './elements/Wizard';
import { ConfigureStep, ConfirmationStep, SelectProviderStep, TestConfigurationStep, VerifyDomainStep } from './steps';

/** The ConfigureSSO step graph the entry-guard `<Wizard>` derives its machine from. */
export const ConfigureSSOSteps = (): JSX.Element => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();
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
