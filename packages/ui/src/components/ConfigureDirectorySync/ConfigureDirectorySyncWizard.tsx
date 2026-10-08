import React from 'react';

import { useConfigureDirectorySyncWizardController } from './configure-directory-sync-wizard.controller';
import { useConfigureDirectorySyncWizardModel } from './configure-directory-sync-wizard.model';
import { ConfigureDirectorySyncWizardView } from './configure-directory-sync-wizard.view';
import { ConfigureDirectorySyncProvider } from './ConfigureDirectorySyncContext';

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
  const model = useConfigureDirectorySyncWizardModel();
  const controller = useConfigureDirectorySyncWizardController(model);
  return (
    <ConfigureDirectorySyncWizardView
      title={title}
      {...model}
      {...controller}
    />
  );
};
