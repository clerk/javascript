import { Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import type { useSamlGoogleServiceProviderStepController } from './saml-google-service-provider-step.controller';

export const SamlGoogleServiceProviderStepView = ({
  acsUrl,
  spEntityId,
  acsUrlField,
  spEntityIdField,
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: ReturnType<typeof useSamlGoogleServiceProviderStepController> & {
  acsUrl: string;
  spEntityId: string;
}): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.headerSubtitle')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.title')}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.paragraph')}
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
                'configureSSO.configureStep.samlGoogle.serviceProviderStep.nameIdInstructions.step1',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.serviceProviderStep.nameIdInstructions.step2',
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
