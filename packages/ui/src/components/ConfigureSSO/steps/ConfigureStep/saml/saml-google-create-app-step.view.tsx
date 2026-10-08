import { Col, descriptors, localizationKeys, Text } from '@/customizables';

import { Step } from '../../../elements/Step';
import type { WizardStepNavigation } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

export const SamlGoogleCreateAppStepView = ({
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: WizardStepNavigation): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlGoogle.createAppStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.title',
              )}
            />

            <Col
              elementDescriptor={descriptors.configureSSOInstructionsList}
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'disc',
              })}
            >
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step4',
                )}
              />
            </Col>
          </Col>
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
