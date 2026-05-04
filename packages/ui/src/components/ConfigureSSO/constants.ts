import type { WizardStep } from '@/elements/Wizard';

import type { ConfigureSSOData } from './ConfigureSSOContext';
import { Configure, ProvideEmail, TestStep, VerifyDomain } from './steps';

export const CONFIGURE_SSO_STEPS: ReadonlyArray<WizardStep<ConfigureSSOData>> = [
  {
    id: 'provide-email',
    path: 'provide-email',
    label: 'Provide email',
    Component: ProvideEmail,
    // Skip this step when the user already has an email address
    shouldSkip: data => data.email !== '',
  },
  {
    id: 'verify-domain',
    path: 'verify-domain',
    label: 'Verify domain',
    Component: VerifyDomain,
    isOptional: true,
    // Skip this step when the primary email address domain is already verified
    shouldSkip: data => data.domainAlreadyVerified,
  },
  {
    id: 'configure',
    path: 'configure',
    label: 'Configure',
    Component: Configure,
  },
  {
    id: 'test',
    path: 'test',
    label: 'Test',
    Component: TestStep,
  },
];
