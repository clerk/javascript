import { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { useCoreUser, useEnvironment } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { useRouter } from '../../ui/router';
import { useWizard, Wizard } from '../common';
import { Text } from '../customizables';
import { Form, useCardState, withCardStateProvider } from '../elements';
import { handleError, useFormControl } from '../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';
import { magicLinksEnabledForInstance } from './utils';
import { VerifyWithCode } from './VerifyWithCode';

export const EmailPage = withCardStateProvider(() => {
  const title = 'Add email address';
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const preferMagicLinks = magicLinksEnabledForInstance(environment);

  const { params } = useRouter();
  const { id } = params || {};

  const emailAddressRef = React.useRef<EmailAddressResource | undefined>(user.emailAddresses.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: emailAddressRef.current ? 1 : 0 });

  const emailField = useFormControl('emailAddress', `nikos+${Date.now()}@clerk.dev`, {
    type: 'text',
    label: 'Email address',
  });

  const canSubmit = emailField.value.length > 1 && user.username !== emailField.value;

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    return user
      .createEmailAddress({ email: emailField.value })
      .then(res => {
        emailAddressRef.current = res;
        wizard.nextStep();
      })
      .catch(e => handleError(e, [emailField], card.setError));
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={addEmail}>
          <Form.ControlRow>
            <Form.Control
              {...emailField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Text variant='regularRegular'>
            {preferMagicLinks
              ? 'An email containing a verification link will be sent to this email address.'
              : 'An email containing a verification code will be sent to this email address.'}
          </Text>
          <ContentPage.Toolbar>
            <FormButtons
              isDisabled={!canSubmit}
              onCancel={() => navigate('../')}
            />
          </ContentPage.Toolbar>
        </Form.Root>
      </ContentPage.Root>

      <ContentPage.Root headerTitle={title}>
        <VerifyWithCode
          nextStep={wizard.nextStep}
          identification={emailAddressRef.current}
          identifier={emailAddressRef.current?.emailAddress}
          prepareVerification={() => emailAddressRef.current?.prepareVerification({ strategy: 'email_code' })}
        />
      </ContentPage.Root>

      <SuccessPage
        title={title}
        text={`The email ${emailAddressRef.current?.emailAddress || ''} has been added to your account.`}
      />
    </Wizard>
  );
});
