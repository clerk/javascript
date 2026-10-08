import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys, useLocalizations } from '../../customizables';
import { useConfirmPassword } from '../../hooks';
import type { useResetPasswordModel } from './reset-password.model';

type ResetPasswordModel = ReturnType<typeof useResetPasswordModel>;

export function useResetPasswordController(model: ResetPasswordModel) {
  const card = useCardState();
  const { t, locale } = useLocalizations();

  React.useEffect(() => {
    if (model.requiresNewPassword) {
      card.setError(t(localizationKeys('signIn.resetPassword.requiredMessage')));
    }
  }, []);

  const passwordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    validatePassword: true,
    buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings: model.passwordSettings }),
  });

  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const sessionsField = useFormControl('signOutOfOtherSessions', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__signOutOfOtherSessions'),
    defaultChecked: true,
  });

  const { setConfirmPasswordFeedback, isPasswordMatch } = useConfirmPassword({
    passwordField,
    confirmPasswordField: confirmField,
  });

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const resetPassword = async () => {
    if (!isPasswordMatch) {
      return;
    }

    passwordField.clearFeedback();
    confirmField.clearFeedback();
    try {
      return await model.resetPassword(passwordField.value, sessionsField.checked);
    } catch (error) {
      return handleError(error as Error, [passwordField, confirmField], card.setError);
    }
  };

  return {
    identifier: model.identifier,
    requiresNewPassword: model.requiresNewPassword,
    error: card.error,
    passwordField,
    confirmField,
    sessionsField,
    setConfirmPasswordFeedback,
    canSubmit: isPasswordMatch,
    validateForm,
    resetPassword,
    goBack: model.goBack,
  };
}
