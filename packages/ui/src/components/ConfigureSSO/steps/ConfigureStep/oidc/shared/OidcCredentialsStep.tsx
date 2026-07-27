import React, { type JSX } from 'react';

import { localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../../shared/ActiveConnectionAlert';

export const OidcCredentialsStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const clientIdField = useFormControl('clientId', enterpriseConnection?.oauthConfig?.clientId ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.placeholder'),
    isRequired: true,
  });
  const clientSecretField = useFormControl('clientSecret', '', {
    type: 'password',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.placeholder'),
    isRequired: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit = clientIdField.value.trim().length > 0 && clientSecretField.value.trim().length > 0 && !isSubmitting;

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await updateConnection(enterpriseConnection.id, {
        oidc: {
          clientId: clientIdField.value.trim(),
          clientSecret: clientSecretField.value.trim(),
        },
      });
      void goNext();
    } catch (err) {
      handleError(err as Error, [clientIdField, clientSecretField], card.setError);
      setIsSubmitting(false);
    }
  };

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
          onClick={() => goPrev()}
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
