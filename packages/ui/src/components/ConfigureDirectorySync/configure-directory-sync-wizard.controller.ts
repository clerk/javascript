import React from 'react';

import { localizationKeys } from '@/customizables';

import type { WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import type { useConfigureDirectorySyncWizardModel } from './configure-directory-sync-wizard.model';

export const useConfigureDirectorySyncWizardController = ({
  hasSsoConnection,
  hasDirectory,
}: ReturnType<typeof useConfigureDirectorySyncWizardModel>) => {
  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      {
        id: 'configure',
        label: localizationKeys('configureDirectorySync.stepper.configure'),
        isComplete: () => hasSsoConnection && hasDirectory,
      },
      {
        id: 'attributes',
        label: localizationKeys('configureDirectorySync.stepper.attributes'),
        isReachable: () => hasSsoConnection && hasDirectory,
      },
      {
        id: 'test',
        label: localizationKeys('configureDirectorySync.stepper.test'),
        isReachable: () => hasSsoConnection && hasDirectory,
      },
    ],
    [hasSsoConnection, hasDirectory],
  );
  return { steps };
};
