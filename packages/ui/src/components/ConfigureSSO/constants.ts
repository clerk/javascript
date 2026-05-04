import type { WizardStep } from '@/elements/Wizard';

import type { ConfigureSSOData } from './ConfigureSSOContext';
import {
  ConfigureCreateApp,
  ConfigureMapAttributes,
  ConfirmationStep,
  ProvideEmail,
  TestStep,
  VerifyDomain,
} from './steps';

export const CONFIGURE_SSO_STEPS: ReadonlyArray<WizardStep<ConfigureSSOData>> = [
  {
    id: 'verify-email-domain',
    path: 'verify-email-domain',
    label: 'Verify domain',
    isOptional: true,
    // Skip this step when there's a primary email address domain already verified
    shouldSkip: data => data.domainAlreadyVerified,
    steps: [
      {
        id: 'provide-email',
        path: 'provide-email',
        Component: ProvideEmail,
      },
      {
        id: 'verify-domain',
        path: 'verify-domain',
        Component: VerifyDomain,
      },
    ],
  },
  {
    id: 'configure',
    path: 'configure',
    label: 'Configure',
    steps: [
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
    Component: TestStep,
  },
  {
    id: 'confirmation',
    path: 'confirmation',
    label: 'Confirmation',
    Component: ConfirmationStep,
  },
];
