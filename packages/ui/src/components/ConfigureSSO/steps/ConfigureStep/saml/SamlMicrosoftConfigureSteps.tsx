import { type JSX } from 'react';

import { Box, Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';

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
                'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.title',
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
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step3',
                )}
              />

              <Box
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                sx={theme => ({
                  fontSize: theme.fontSizes.$md,
                  lineHeight: theme.lineHeights.$small,
                  color: theme.colors.$colorMutedForeground,
                })}
              >
                <Text
                  as='span'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.label',
                  )}
                />
                <Col
                  elementDescriptor={descriptors.configureSSOInstructionsList}
                  as='ul'
                  sx={theme => ({
                    gap: theme.space.$1x5,
                    marginBlockStart: theme.space.$1x5,
                    marginBlockEnd: 0,
                    paddingInlineStart: theme.space.$5,
                    listStyleType: 'circle',
                  })}
                >
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.appName',
                    )}
                  />
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.nonGallery',
                    )}
                  />
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.create',
                    )}
                  />
                </Col>
              </Box>
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.title',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.paragraph1',
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
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step4',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step5',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step6',
                )}
              />
            </Col>
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
