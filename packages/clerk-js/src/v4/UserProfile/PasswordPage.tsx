import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useWizard, Wizard } from '../common';
import { Form, useCardState, withCardStateProvider } from '../elements';
import { handleError, useFormControl } from '../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const PasswordPage = withCardStateProvider(() => {
  const user = useCoreUser();
  const card = useCardState();
  const wizard = useWizard();
  const passwordField = useFormControl('password', '', { type: 'password', label: 'New password', isRequired: true });
  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: 'Confirm password',
    isRequired: true,
  });

  const canSubmit = passwordField.value && passwordField.value === confirmField.value && passwordField.value.length > 7;

  const validateForm = () => {
    if (passwordField.value && confirmField.value && passwordField.value !== confirmField.value) {
      passwordField.setError("Passwords don't match.");
    } else if (passwordField.value.length < 8) {
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
      <ContentPage.Root headerTitle='Set password'>
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
        title={'Set password'}
        text={'Your password has been set.'}
      />
    </Wizard>
  );
});
