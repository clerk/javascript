import { Col, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import type { useSamlCustomCreateAppStepController } from './saml-custom-create-app-step.controller';

export const SamlCustomCreateAppStepView = ({
  acsUrl,
  spEntityId,
  acsUrlField,
  spEntityIdField,
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: ReturnType<typeof useSamlCustomCreateAppStepController> & { acsUrl: string; spEntityId: string }): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.headerSubtitle')}
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
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.paragraph',
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
