import { Box, Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import type { useSamlMicrosoftServiceProviderStepController } from './saml-microsoft-service-provider-step.controller';

export const SamlMicrosoftServiceProviderStepView = ({
  acsUrl,
  spEntityId,
  acsUrlField,
  spEntityIdField,
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: ReturnType<typeof useSamlMicrosoftServiceProviderStepController> & {
  acsUrl: string;
  spEntityId: string;
}): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.headerSubtitle')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.title')}
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
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step1')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step2')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step3')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step4')}
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
                    'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step5',
                  )}
                />
                <Col sx={theme => ({ gap: theme.space.$4, marginBlock: theme.space.$3 })}>
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
                </Col>
              </Box>

              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step6')}
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
