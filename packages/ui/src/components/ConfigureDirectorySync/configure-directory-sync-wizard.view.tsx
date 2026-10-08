import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard } from '../ConfigureSSO/elements/Wizard';
import type { useConfigureDirectorySyncWizardController } from './configure-directory-sync-wizard.controller';
import type { useConfigureDirectorySyncWizardModel } from './configure-directory-sync-wizard.model';
import type { ConfigureDirectorySyncWizardProps } from './ConfigureDirectorySyncWizard';
import { AttributeMappingStep } from './steps/AttributeMappingStep';
import { ConfigureStep } from './steps/ConfigureStep';
import { TestSyncStep } from './steps/TestSyncStep';

export const ConfigureDirectorySyncWizardView = ({
  title,
  steps,
  isLoading,
}: Pick<ConfigureDirectorySyncWizardProps, 'title'> &
  ReturnType<typeof useConfigureDirectorySyncWizardController> &
  Pick<ReturnType<typeof useConfigureDirectorySyncWizardModel>, 'isLoading'>): JSX.Element => {
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
