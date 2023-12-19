import { useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContent, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { emailLinksEnabledForInstance } from './utils';
import { VerifyWithCode } from './VerifyWithCode';
import { VerifyWithLink } from './VerifyWithLink';

type EmailFormProps = FormProps & {
  emailId?: string;
};
export const EmailForm = withCardStateProvider((props: EmailFormProps) => {
  const { emailId: id, onSuccess, onReset } = props;
  const title = localizationKeys('userProfile.emailAddressPage.title');
  const card = useCardState();
  const { user } = useUser();
  const environment = useEnvironment();
  const preferEmailLinks = emailLinksEnabledForInstance(environment);

  const emailAddressRef = React.useRef<EmailAddressResource | undefined>(user?.emailAddresses.find(a => a.id === id));
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
    return user
      ?.createEmailAddress({ email: emailField.value })
      .then(res => {
        emailAddressRef.current = res;
        wizard.nextStep();
      })
      .catch(e => handleError(e, [emailField], card.setError));
  };

  return (
    <Wizard {...wizard.props}>
      <FormContent
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        <Form.Root onSubmit={addEmail}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.PlainInput
              {...emailField.props}
              autoFocus
            />
          </Form.ControlRow>
          <Text
            localizationKey={
              preferEmailLinks
                ? localizationKeys('userProfile.emailAddressPage.emailLink.formHint')
                : localizationKeys('userProfile.emailAddressPage.emailCode.formHint')
            }
          />
          <FormButtons
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContent>

      <FormContent
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        {preferEmailLinks ? (
          <VerifyWithLink
            nextStep={onSuccess}
            email={emailAddressRef.current as any}
            onReset={wizard.prevStep}
          />
        ) : (
          <VerifyWithCode
            nextStep={onSuccess}
            identification={emailAddressRef.current}
            identifier={emailAddressRef.current?.emailAddress}
            prepareVerification={() => emailAddressRef.current?.prepareVerification({ strategy: 'email_code' })}
            onReset={wizard.prevStep}
          />
        )}
      </FormContent>
    </Wizard>
  );
});
