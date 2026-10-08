import { localizationKeys, Text } from '@/customizables';

import { Step } from '../../../elements/Step';
import type { WizardStepNavigation } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

export const SamlCustomAssignUsersStepView = ({
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: WizardStepNavigation): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.paragraph')}
          />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={goPrev}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={goNext}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};
