import { Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import type { useSamlOktaCreateAppStepController } from './saml-okta-create-app-step.controller';

export const SamlOktaCreateAppStepView = ({
  acsUrl,
  spEntityId,
  acsUrlField,
  spEntityIdField,
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: ReturnType<typeof useSamlOktaCreateAppStepController> & { acsUrl: string; spEntityId: string }): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.createAppStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.title',
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
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step4',
                )}
              />
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.title',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.paragraph1',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.paragraph2',
              )}
            />
          </Col>

          <Form.ControlRow elementId={acsUrlField.id}>
            <Form.CommonInputWrapper {...acsUrlField.props}>
              <ClipboardInput
                value={acsUrl}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Form.ControlRow elementId={spEntityIdField.id}>
            <Form.CommonInputWrapper {...spEntityIdField.props}>
              <ClipboardInput
                value={spEntityId}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.title',
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
                  'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.step2',
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
