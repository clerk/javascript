import { useUser } from '@clerk/shared/react';

import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';

export const VerifyDomainStep = (): JSX.Element => {
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
            title='Verify your email address'
            description='Verify the domain to configure your enterprise connection.'
          >
            <InnerStepCounter />
          </Step.Header>

          <Step.Body>
            {!primaryEmailAddress && (
              <Wizard.Step id='provide-email'>
                <ProvideEmailStep />
              </Wizard.Step>
            )}
            <Wizard.Step id='verify-email-address'>
              <EnterVerificationCodeStep />
            </Wizard.Step>
          </Step.Body>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

const InnerStepCounter = (): JSX.Element => {
  const { currentIndex, totalSteps } = useWizard();
  return (
    <Step.Counter
      total={totalSteps}
      current={currentIndex + 1}
    />
  );
};

export const ProvideEmailStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Text>UI goes here</Text>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};

export const EnterVerificationCodeStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Text>UI goes here</Text>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};
