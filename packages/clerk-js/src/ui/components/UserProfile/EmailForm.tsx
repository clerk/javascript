import { useReverification, useUser } from '@clerk/shared/react';
import type { EmailAddressResource, EnvironmentResource, PrepareEmailAddressVerificationParams } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { VerifyWithCode } from './VerifyWithCode';
import { VerifyWithEnterpriseConnection } from './VerifyWithEnterpriseConnection';
import { VerifyWithLink } from './VerifyWithLink';

type EmailFormProps = FormProps & {
  emailId?: string;
};
export const EmailForm = withCardStateProvider((props: EmailFormProps) => {
  const { emailId: id, onSuccess, onReset } = props;
  const card = useCardState();
  const { user } = useUser();
  const environment = useEnvironment();

  const [createEmailAddress] = useReverification((email: string) => user?.createEmailAddress({ email }));

  const emailAddressRef = React.useRef<EmailAddressResource | undefined>(user?.emailAddresses.find(a => a.id === id));
  const strategy = getEmailAddressVerificationStrategy(emailAddressRef.current, environment);
  const wizard = useWizard({
    defaultStep: emailAddressRef.current ? 1 : 0,
    onNextStep: () => card.setError(undefined),
  });

  const emailField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    isRequired: true,
  });

  const canSubmit = emailField.value.length > 1 && user?.username !== emailField.value;

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    return createEmailAddress(emailField.value)
      .then(res => {
        emailAddressRef.current = res;
        wizard.nextStep();
      })
      .catch(e => handleError(e, [emailField], card.setError));
  };

  const translationKey = getTranslationKeyByStrategy(strategy);

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={localizationKeys('userProfile.emailAddressPage.title')}
        headerSubtitle={localizationKeys(`${translationKey}.formHint`)}
      >
        <Form.Root onSubmit={addEmail}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.PlainInput
              {...emailField.props}
              autoFocus
            />
          </Form.ControlRow>
          <FormButtons
            submitLabel={localizationKeys('userProfile.formButtonPrimary__add')}
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={localizationKeys('userProfile.emailAddressPage.verifyTitle')}
        headerSubtitle={localizationKeys(`${translationKey}.formSubtitle`, {
          identifier: emailAddressRef.current?.emailAddress,
        })}
      >
        {strategy === 'email_link' && (
          <VerifyWithLink
            nextStep={onSuccess}
            email={emailAddressRef.current as any}
            onReset={onReset}
          />
        )}
        {strategy === 'email_code' && (
          <VerifyWithCode
            nextStep={onSuccess}
            identification={emailAddressRef.current}
            identifier={emailAddressRef.current?.emailAddress}
            prepareVerification={() => emailAddressRef.current?.prepareVerification({ strategy: 'email_code' })}
            onReset={onReset}
          />
        )}
        {strategy === 'enterprise_sso' && (
          <VerifyWithEnterpriseConnection
            nextStep={onSuccess}
            email={emailAddressRef.current as any}
            onReset={onReset}
          />
        )}
      </FormContainer>
    </Wizard>
  );
});

const getTranslationKeyByStrategy = (strategy: PrepareEmailAddressVerificationParams['strategy']) => {
  switch (strategy) {
    case 'email_code':
      return 'userProfile.emailAddressPage.emailCode';
    case 'enterprise_sso':
      return 'userProfile.emailAddressPage.enterpriseSsoLink';
    case 'email_link':
      return 'userProfile.emailAddressPage.emailLink';
    default:
      throw new Error(`Unsupported strategy for email verification: ${strategy}`);
  }
};

function isEmailLinksEnabledForInstance(env: EnvironmentResource): boolean {
  const { userSettings } = env;
  const { email_address } = userSettings.attributes;
  return email_address.enabled && email_address.verifications.includes('email_link');
}

const getEmailAddressVerificationStrategy = (
  emailAddress: EmailAddressResource | undefined,
  env: EnvironmentResource,
): PrepareEmailAddressVerificationParams['strategy'] => {
  if (emailAddress?.hasEnterpriseSso) {
    return 'enterprise_sso';
  }

  return isEmailLinksEnabledForInstance(env) ? 'email_link' : 'email_code';
};
