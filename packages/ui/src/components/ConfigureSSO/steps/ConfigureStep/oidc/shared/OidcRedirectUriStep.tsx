import React, { type JSX } from 'react';

import { Col, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';

export const OidcRedirectUriStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();
  const redirectUri = enterpriseConnection?.oauthConfig?.redirectUri ?? '';
  const redirectUriField = useFormControl('redirectUri', redirectUri, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.redirectUri.label'),
    isRequired: false,
  });

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.paragraph')}
            />
          </Col>

          <Form.ControlRow elementId={redirectUriField.id}>
            <Form.CommonInputWrapper {...redirectUriField.props}>
              <ClipboardInput
                value={redirectUri}
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
