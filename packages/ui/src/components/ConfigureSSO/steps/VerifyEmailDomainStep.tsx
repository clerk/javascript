import { useUser } from '@clerk/shared/react';

import { descriptors, Flow } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';
import { ProvideEmail } from './ProvideEmailStep';
import { VerifyEmailAddressStep } from './VerifyEmailAddressStep';

export const VerifyEmailDomainStep = (): JSX.Element => {
  const { user } = useUser();
  const primaryEmailAddress = user?.primaryEmailAddress;

  return (
    <Flow.Part part='verifyDomain'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('verify-domain')}
      >
        <Wizard>
          <Step.Header
            title='Verify your domain'
            description='Verify the domain you want to enable the enterprise connection on.'
          >
            <InnerStepCounter />
          </Step.Header>

          {!primaryEmailAddress && (
            <Wizard.Step id='provide-email'>
              <ProvideEmail />
            </Wizard.Step>
          )}
          <Wizard.Step id='verify-email-address'>
            <VerifyEmailAddressStep />
          </Wizard.Step>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

/**
 * Renders Step.Counter scoped to the inner verify-email-domain wizard.
 * Auto-hides when there's only one inner step (e.g., when the user
 * already has a verified primary email and ProvideEmail is skipped).
 */
const InnerStepCounter = (): JSX.Element => {
  const { currentIndex, totalSteps } = useWizard();
  return (
    <Step.Counter
      total={totalSteps}
      current={currentIndex + 1}
    />
  );
};
