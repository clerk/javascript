import React from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard, type WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import { PrototypeControlsPanel, PrototypeStateProvider, usePrototype } from './prototype';
import { ActivateDirectorySyncStep } from './steps/ActivateDirectorySyncStep';
import { AttributeMappingStep } from './steps/AttributeMappingStep';
import { ConnectionStep } from './steps/ConnectionStep';
import { EndpointTokenStep } from './steps/EndpointTokenStep';
import { GroupMappingStep } from './steps/GroupMappingStep';
import { TestSyncStep } from './steps/TestSyncStep';

export type ConfigureDirectorySyncWizardProps = {
  title?: React.ReactNode;
  onExit?: () => void;
};

/**
 * PROTOTYPE ONLY — discussion skeleton for the self-serve Directory Sync
 * onboarding flow. Mirrors the ConfigureSSO wizard's shape and reuses its
 * chrome; every step runs on fake local state (see ./prototype.tsx).
 */
export const ConfigureDirectorySyncWizard = (props: ConfigureDirectorySyncWizardProps): JSX.Element => (
  <PrototypeStateProvider>
    <WizardInternal {...props} />
  </PrototypeStateProvider>
);

const WizardInternal = ({ title, onExit }: ConfigureDirectorySyncWizardProps): JSX.Element => {
  const { isSetupComplete, isDirectorySyncActive } = usePrototype();

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'connection', label: 'Connection', isComplete: () => isSetupComplete },
      { id: 'endpoint', label: 'Endpoint', isReachable: () => isSetupComplete },
      { id: 'attributes', label: 'Attributes', isReachable: () => isSetupComplete },
      { id: 'test', label: 'Test', isReachable: () => isSetupComplete },
      { id: 'groups', label: 'Groups', isReachable: () => isSetupComplete },
      {
        id: 'activate',
        label: 'Activate',
        isReachable: () => isSetupComplete,
        isComplete: () => isDirectorySyncActive,
      },
    ],
    [isSetupComplete, isDirectorySyncActive],
  );

  return (
    <Wizard
      steps={steps}
      initialStepId='connection'
    >
      <ConfigureSSOHeader title={title} />

      <Wizard.Match id='connection'>
        <CardStateProvider>
          <Step>
            <ConnectionStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='endpoint'>
        <CardStateProvider>
          <Step>
            <EndpointTokenStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='attributes'>
        <CardStateProvider>
          <Step>
            <AttributeMappingStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='test'>
        <CardStateProvider>
          <Step>
            <TestSyncStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='groups'>
        <CardStateProvider>
          <Step>
            <GroupMappingStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='activate'>
        <CardStateProvider>
          <Step>
            <ActivateDirectorySyncStep onExit={onExit} />
          </Step>
        </CardStateProvider>
      </Wizard.Match>

      <PrototypeControlsPanel />
    </Wizard>
  );
};
