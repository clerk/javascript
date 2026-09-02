import React from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard, type WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import { ConfigureDirectorySyncProvider, useConfigureDirectorySync } from './ConfigureDirectorySyncContext';
import { AttributeMappingStep } from './steps/AttributeMappingStep';
import { ConfigureStep } from './steps/ConfigureStep';
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
  const { connection, directory, isLoading } = useConfigureDirectorySync();
  const hasSsoConnection = Boolean(connection);
  const hasDirectory = Boolean(directory);

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'configure', label: 'Configure', isComplete: () => hasSsoConnection && hasDirectory },
      { id: 'attributes', label: 'Attributes', isReachable: () => hasSsoConnection && hasDirectory },
      { id: 'test', label: 'Test', isReachable: () => hasSsoConnection && hasDirectory },
    ],
    [hasSsoConnection, hasDirectory],
  );

  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <Wizard
      steps={steps}
      initialStepId='configure'
    >
      <ConfigureSSOHeader title={title} />

      <Wizard.Match id='configure'>
        <CardStateProvider>
          <Step>
            <ConfigureStep />
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
    </Wizard>
  );
};
