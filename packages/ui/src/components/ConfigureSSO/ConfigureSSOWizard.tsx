import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { type WizardStepConfig } from './elements/Wizard';
import { Wizard } from './elements/Wizard';
import { ConfigureStep, ConfirmationStep, SelectProviderStep, TestConfigurationStep, VerifyDomainStep } from './steps';

/**
 * The wizard's data surface — exactly `ConfigureSSOProvider`'s props, derived
 * from the provider so the two can never drift.
 */
export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'>;

/**
 * The pure, data-injected ConfigureSSO flow: the provider seeded with
 * host-supplied data plus the step graph the entry-guard `<Wizard>` derives its
 * machine from. It performs no fetching and never observes a loading state —
 * hosts own data fetching, the loading skeleton, and permission gating, and
 * inject the resolved data here. Today's hosts are the Security page in
 * `OrganizationProfile` and the standalone `ConfigureSSO` component backing the
 * internal mount.
 */
export const ConfigureSSOWizard = (props: ConfigureSSOWizardProps): JSX.Element => {
  // The guards read the connection from the prop, not from `useConfigureSSO()`:
  // this component renders the provider itself, so the hook would throw at this
  // level. The step bodies render below the provider and keep reading context.
  const { organizationEnterpriseConnection: c } = props;

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
  // Each top-level step owns its own `CardStateProvider`, so a card-level error
  // raised on one step lives in that step's scope only. When the wizard moves
  // (a breadcrumb jump, back-nav, or an emergent clamp/reset re-seat), the
  // departed step unmounts and its card state — error and all — goes with it;
  // the step we land on mounts a fresh, clean card scope. No cross-step error
  // bleed, and no wizard-level callback needed to clear it. The root provider on
  // `ConfigureSSO` stays as an ancestor for shared elements; these step-level
  // providers shadow it. Context flows through portals, so the footer/dialog
  // subtrees resolve to their step's provider.
  return (
    <ConfigureSSOProvider {...props}>
      <Wizard steps={steps}>
        <ConfigureSSOHeader />

        <Wizard.Match id='verify-domain'>
          <CardStateProvider>
            <VerifyDomainStep />
          </CardStateProvider>
        </Wizard.Match>

        <Wizard.Match id='select-provider'>
          <CardStateProvider>
            <SelectProviderStep />
          </CardStateProvider>
        </Wizard.Match>

        <Wizard.Match id='configure'>
          <CardStateProvider>
            <ConfigureStep />
          </CardStateProvider>
        </Wizard.Match>

        <Wizard.Match id='test'>
          <CardStateProvider>
            <TestConfigurationStep />
          </CardStateProvider>
        </Wizard.Match>

        <Wizard.Match id='confirmation'>
          <CardStateProvider>
            <ConfirmationStep />
          </CardStateProvider>
        </Wizard.Match>
      </Wizard>
    </ConfigureSSOProvider>
  );
};
