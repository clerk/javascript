import {
  ConfigureCreateApp,
  ConfigureMapAttributes,
  ConfirmationStep,
  ProvideEmail,
  TestConfigurationStep,
  VerifyDomain,
} from './steps';
import type { ConfigureSSOWizardStep } from './wizard';

export const CONFIGURE_SSO_STEPS: ReadonlyArray<ConfigureSSOWizardStep> = [
  {
    id: 'verify-email-domain',
    path: 'verify-email-domain',
    label: 'Verify domain',
    innerSteps: [
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
    // Skip this step when there's a primary email address domain already verified
    shouldSkip: data => data.domainAlreadyVerified,
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
