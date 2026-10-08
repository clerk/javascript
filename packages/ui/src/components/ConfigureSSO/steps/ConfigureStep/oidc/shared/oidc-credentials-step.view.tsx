import { localizationKeys, Text } from '@/customizables';
import { Form } from '@/elements/Form';

import { Step } from '../../../../elements/Step';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../../shared/ActiveConnectionAlert';
import type { useOidcCredentialsStepController } from './oidc-credentials-step.controller';

export const OidcCredentialsStepView = ({
  clientIdField,
  clientSecretField,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleContinue,
}: ReturnType<typeof useOidcCredentialsStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.paragraph')}
          />

          <Form.ControlRow elementId={clientIdField.id}>
            <Form.PlainInput {...clientIdField.props} />
          </Form.ControlRow>

          <Form.ControlRow elementId={clientSecretField.id}>
            <Form.PasswordInput {...clientSecretField.props} />
          </Form.ControlRow>

          <ActiveConnectionAlert />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={goPrev}
          isDisabled={isFirstStep || isSubmitting}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={isSubmitting}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
    </>
  );
};
