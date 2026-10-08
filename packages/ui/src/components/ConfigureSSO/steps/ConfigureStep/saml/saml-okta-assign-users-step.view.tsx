import { Col, descriptors, localizationKeys, Text } from '@/customizables';

import { Step } from '../../../elements/Step';
import type { WizardStepNavigation } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

export const SamlOktaAssignUsersStepView = ({
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: WizardStepNavigation): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.assignUsersStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.paragraph',
            )}
          />

          <Col
            elementDescriptor={descriptors.configureSSOInstructionsList}
            as='ol'
            sx={theme => ({
              gap: theme.space.$1x5,
              margin: 0,
              paddingInlineStart: theme.space.$5,
              listStyleType: 'decimal',
            })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step1',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step2',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step3',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step4',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step5',
              )}
            />
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
