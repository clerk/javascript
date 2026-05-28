import { type JSX } from 'react';

import { Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';

import { Step } from '../../../elements/Step';
import { useWizard, Wizard } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

export const SamlMicrosoftConfigureSteps = (): JSX.Element => {
  return (
    <Wizard.Step id='create-app'>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.createAppStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>
      <SamlMicrosoftCreateAppStep />
    </Wizard.Step>
  );
};

const SamlMicrosoftCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.title',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.paragraph',
              )}
            />
          </Col>
        </Step.Section>
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
