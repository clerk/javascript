import type { WizardStep } from '@/elements/Wizard';

import type { ConfigureSSOData } from './ConfigureSSOContext';
import {
  AddEmailAddressStep,
  ConfigureCreateApp,
  ConfigureMapAttributes,
  ConfirmationStep,
  TestConfigurationStep,
  VerifyDomainStep,
} from './steps';

export const CONFIGURE_SSO_STEPS: ReadonlyArray<WizardStep<ConfigureSSOData>> = [
  {
    id: 'verify-email-domain',
    path: 'verify-email-domain',
    label: 'Verify domain',
    innerSteps: [
      {
        id: 'add-email-address',
        path: 'add-email-address',
        Component: AddEmailAddressStep,
        shouldSkip: data => !!data.primaryEmailAddress,
      },
      {
        id: 'verify-domain',
        path: 'verify-domain',
        Component: VerifyDomainStep,
      },
    ],
  },
  {
    id: 'configure',
    path: 'configure',
    label: 'Configure',
    innerSteps: [
      {
        id: 'create-app',
        path: 'create-app',
        Component: ConfigureCreateApp,
      },
      {
        id: 'map-attributes',
        path: 'map-attributes',
        Component: ConfigureMapAttributes,
      },
    ],
  },
  {
    id: 'test',
    path: 'test',
    label: 'Test',
    Component: TestConfigurationStep,
  },
  {
    id: 'confirmation',
    path: 'confirmation',
    label: 'Confirmation',
    Component: ConfirmationStep,
  },
];
