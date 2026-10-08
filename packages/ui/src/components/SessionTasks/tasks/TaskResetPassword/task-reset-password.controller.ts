import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';

import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { useConfirmPassword } from '@/ui/hooks';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { useTaskResetPasswordModel } from './task-reset-password.model';

export const useTaskResetPasswordController = (model: ReturnType<typeof useTaskResetPasswordModel>) => {
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const passwordField = useFormControl('newPassword', '', {
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

  const mounted = useRef(true);
  const current = useRef({ key: model.scopeKey, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.key !== model.scopeKey) {
    current.current = { key: model.scopeKey, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ card, model, passwordField, confirmField });
  latest.current = { card, model, passwordField, confirmField };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const run = (action: (isCurrent: () => boolean) => Promise<void>, release?: () => void) => {
    const generation = owner.generation;
    const ownsRequest = () => mounted.current && current.current === owner && owner.generation === generation;
    latest.current.card.setError(undefined);
    const request = Promise.resolve()
      .then(() => {
        if (ownsRequest() && latest.current.model.canRun()) {
          return action(ownsRequest);
        }
        return;
      })
      .catch(error => {
        if (ownsRequest() && latest.current.model.canRun()) {
          const { card, passwordField, confirmField } = latest.current;
          handleError(error, [passwordField, confirmField], card.setError);
        }
      })
      .finally(() => {
        release?.();
        if (owner.pending === request) {
          owner.pending = undefined;
        }
      });
    owner.pending = request;
    return request;
  };

  const resetPassword = () => {
    if (!canRun() || !isPasswordMatch) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    passwordField.clearFeedback();
    confirmField.clearFeedback();
    return run(isCurrent => model.updatePassword(passwordField.value, sessionsField.checked, isCurrent));
  };

  const signOut = () => {
    if (!canRun() || owner.pending) {
      return Promise.resolve();
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return Promise.resolve();
    }
    return run(isCurrent => model.signOut(isCurrent), release);
  };

  const onConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setConfirmPasswordFeedback(event.target.value);
    }
    return confirmField.props.onChange(event);
  };

  return {
    passwordField,
    confirmField,
    sessionsField,
    canSubmit: isPasswordMatch && !card.isLoading,
    isLoading: card.isLoading,
    error: card.error,
    identifier: model.identifier,
    hiddenIdentifier: model.hiddenIdentifier,
    signOut,
    resetPassword,
    validateForm,
    onConfirmChange,
  };
};
