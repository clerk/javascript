import { useReverification, useUser } from '@clerk/shared/react';
import type { EmailAddressResource, PrepareEmailAddressVerificationParams } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { emailLinksEnabledForInstance } from './utils';
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
  const preferEmailLinks = emailLinksEnabledForInstance(environment);

  const [createEmailAddress] = useReverification((email: string) => user?.createEmailAddress({ email }));

  const emailAddressRef = React.useRef<EmailAddressResource | undefined>(user?.emailAddresses.find(a => a.id === id));
  const strategy = getEmailAddressVerificationStrategy(emailAddressRef.current, preferEmailLinks);
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

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={localizationKeys('userProfile.emailAddressPage.title')}
        headerSubtitle={
          preferEmailLinks
            ? localizationKeys('userProfile.emailAddressPage.emailLink.formHint')
            : localizationKeys('userProfile.emailAddressPage.emailCode.formHint')
        }
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
        headerSubtitle={
          // TODO - Get localization per strategy
          preferEmailLinks
            ? localizationKeys('userProfile.emailAddressPage.emailLink.formSubtitle', {
                identifier: emailAddressRef.current?.emailAddress,
              })
            : localizationKeys('userProfile.emailAddressPage.emailCode.formSubtitle', {
                identifier: emailAddressRef.current?.emailAddress,
              })
        }
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

// TODO - Handle `preferEmailLinks`
export const getEmailAddressVerificationStrategy = (
  emailAddress: EmailAddressResource | undefined,
  preferLinks: boolean,
): PrepareEmailAddressVerificationParams['strategy'] => {
  if (emailAddress?.matchesEnterpriseConnection) {
    return 'enterprise_sso';
  }

  return preferLinks ? 'email_link' : 'email_code';
};
