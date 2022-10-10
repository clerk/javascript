import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Form, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const PasswordPage = withCardStateProvider(() => {
  const title = localizationKeys('userProfile.passwordPage.title');
  const user = useCoreUser();
  const card = useCardState();
  const wizard = useWizard();
  const passwordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
  });
  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const canSubmit = passwordField.value && passwordField.value === confirmField.value && passwordField.value.length > 7;

  const validateForm = () => {
    if (passwordField.value && confirmField.value && passwordField.value !== confirmField.value) {
      passwordField.setError("Passwords don't match.");
    } else if (passwordField.value.length > 0 && passwordField.value.length < 8) {
      passwordField.setError('Passwords must be 8 characters or more.');
    } else {
      passwordField.setError(undefined);
    }
  };

  const updatePassword = async () => {
    try {
      await user.update({ password: passwordField.value });
      wizard.nextStep();
    } catch (e) {
      handleError(e, [passwordField, confirmField], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root
          onSubmit={updatePassword}
          onBlur={validateForm}
        >
          <Form.ControlRow>
            <Form.Control
              {...passwordField.props}
              minLength={6}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Form.ControlRow>
            <Form.Control {...confirmField.props} />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage.Root>

      <SuccessPage
        title={title}
        text={localizationKeys('userProfile.passwordPage.successMessage')}
      />
    </Wizard>
  );
});
