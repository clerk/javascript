import React from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard, type WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import { ConfigureDirectorySyncProvider, useConfigureDirectorySync } from './ConfigureDirectorySyncContext';
import { ActivateDirectorySyncStep } from './steps/ActivateDirectorySyncStep';
import { AttributeMappingStep } from './steps/AttributeMappingStep';
import { ConnectionStep } from './steps/ConnectionStep';
import { EndpointTokenStep } from './steps/EndpointTokenStep';
import { TestSyncStep } from './steps/TestSyncStep';

export type ConfigureDirectorySyncWizardProps = {
  title?: React.ReactNode;
  onExit?: () => void;
};

/**
 * The self-serve Directory Sync onboarding flow. Mirrors the ConfigureSSO
 * wizard's shape and reuses its chrome; state comes from the real
 * organization enterprise connection and its SCIM directory.
 */
export const ConfigureDirectorySyncWizard = (props: ConfigureDirectorySyncWizardProps): JSX.Element => (
  <ConfigureDirectorySyncProvider onExit={props.onExit}>
    <WizardInternal {...props} />
  </ConfigureDirectorySyncProvider>
);

const WizardInternal = ({ title }: ConfigureDirectorySyncWizardProps): JSX.Element => {
  const { connection, directory } = useConfigureDirectorySync();
  const hasSsoConnection = Boolean(connection);
  const hasDirectory = Boolean(directory);
  const isDirectorySyncActive = directory?.enabled ?? false;

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'connection', label: 'Connection', isComplete: () => hasSsoConnection },
      { id: 'endpoint', label: 'Endpoint', isReachable: () => hasSsoConnection && hasDirectory },
      { id: 'attributes', label: 'Attributes', isReachable: () => hasSsoConnection && hasDirectory },
      { id: 'test', label: 'Test', isReachable: () => hasSsoConnection && hasDirectory },
      {
        id: 'activate',
        label: 'Activate',
        isReachable: () => hasSsoConnection && hasDirectory,
        isComplete: () => isDirectorySyncActive,
      },
    ],
    [hasSsoConnection, hasDirectory, isDirectorySyncActive],
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

      <Wizard.Match id='activate'>
        <CardStateProvider>
          <Step>
            <ActivateDirectorySyncStep />
          </Step>
        </CardStateProvider>
      </Wizard.Match>
    </Wizard>
  );
};
