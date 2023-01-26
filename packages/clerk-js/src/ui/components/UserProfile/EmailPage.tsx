import type { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser, useEnvironment } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { magicLinksEnabledForInstance } from './utils';
import { VerifyWithCode } from './VerifyWithCode';
import { VerifyWithLink } from './VerifyWithLink';

export const EmailPage = withCardStateProvider(() => {
  const title = localizationKeys('userProfile.emailAddressPage.title');
  const card = useCardState();
  const user = useCoreUser();
  const environment = useEnvironment();
  const preferMagicLinks = magicLinksEnabledForInstance(environment);

  const { params } = useRouter();
  const { id } = params || {};

  const emailAddressRef = React.useRef<EmailAddressResource | undefined>(user.emailAddresses.find(a => a.id === id));
  const wizard = useWizard({
    defaultStep: emailAddressRef.current ? 1 : 0,
    onNextStep: () => card.setError(undefined),
  });

  const emailField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    isRequired: true,
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
      <ContentPage headerTitle={title}>
        <Form.Root onSubmit={addEmail}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.Control
              {...emailField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Text
            localizationKey={
              preferMagicLinks
                ? localizationKeys('userProfile.emailAddressPage.emailLink.formHint')
                : localizationKeys('userProfile.emailAddressPage.emailCode.formHint')
            }
            variant='regularRegular'
          />
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>

      <ContentPage headerTitle={title}>
        {preferMagicLinks ? (
          <VerifyWithLink
            nextStep={wizard.nextStep}
            email={emailAddressRef.current as any}
          />
        ) : (
          <VerifyWithCode
            nextStep={wizard.nextStep}
            identification={emailAddressRef.current}
            identifier={emailAddressRef.current?.emailAddress}
            prepareVerification={() => emailAddressRef.current?.prepareVerification({ strategy: 'email_code' })}
          />
        )}
      </ContentPage>

      <SuccessPage
        title={title}
        text={
          preferMagicLinks
            ? localizationKeys('userProfile.emailAddressPage.emailLink.successMessage', {
                identifier: emailAddressRef.current?.emailAddress || '',
              })
            : localizationKeys('userProfile.emailAddressPage.emailCode.successMessage', {
                identifier: emailAddressRef.current?.emailAddress || '',
              })
        }
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});
