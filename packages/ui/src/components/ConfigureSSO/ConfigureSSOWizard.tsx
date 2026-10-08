import React, { type ComponentProps } from 'react';

import { useConfigureSSOWizardController } from './configure-sso-wizard.controller';
import { useConfigureSSOWizardModel } from './configure-sso-wizard.model';
import { ConfigureSSOWizardView } from './configure-sso-wizard.view';
import { ConfigureSSOProvider } from './ConfigureSSOContext';

export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

export const ConfigureSSOWizard = ({ title, forceInitialStep, ...props }: ConfigureSSOWizardProps): JSX.Element => {
  const model = useConfigureSSOWizardModel(props);
  const controller = useConfigureSSOWizardController(model, forceInitialStep);
  return (
    <ConfigureSSOProvider {...props}>
      <ConfigureSSOWizardView
        title={title}
        {...controller}
      />
    </ConfigureSSOProvider>
  );
};
