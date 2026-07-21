import { useClerk } from '@clerk/shared/react';
import { type JSX } from 'react';

import { Col, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

import { Step } from '../../../elements/Step';
import { useWizard, Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

const OIDC_STEPS: WizardStepConfig[] = [
  { id: 'redirect-uri' },
  { id: 'claims' },
  { id: 'endpoints' },
  { id: 'credentials' },
];

export const OidcCustomConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step, mirroring the SAML custom inner wizard.
    <Wizard
      steps={OIDC_STEPS}
      initialStepId={OIDC_STEPS[0].id}
    >
      <Wizard.Match id='redirect-uri'>
        <OidcRedirectUriStep />
      </Wizard.Match>

      <Wizard.Match id='claims'>
        <OidcClaimsStep />
      </Wizard.Match>

      <Wizard.Match id='endpoints'>
        <OidcEndpointsStep />
      </Wizard.Match>

      <Wizard.Match id='credentials'>
        <OidcCredentialsStep />
      </Wizard.Match>
    </Wizard>
  );
};

const OidcRedirectUriStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { frontendApi } = useClerk();
  const redirectUri = `https://${frontendApi}/v1/oauth_callback`;
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

const OidcClaimsStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.claimsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body />

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

const OidcEndpointsStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body />

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

const OidcCredentialsStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body />

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        {/* Terminal step: the connection submit lands with the credentials step ticket; disabled as a placeholder. */}
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};
