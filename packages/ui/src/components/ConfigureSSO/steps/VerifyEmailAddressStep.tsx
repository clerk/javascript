import { Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const VerifyEmailAddressStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Text>UI goes here</Text>
      </Step.Body>
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
