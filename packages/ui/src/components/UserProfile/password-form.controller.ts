import type { ChangeEvent } from 'react';
import { useRef } from 'react';

import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import type { SuccessPage } from '@/ui/elements/SuccessPage';
import { useConfirmPassword } from '@/ui/hooks';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { PasswordFormProps, usePasswordFormModel } from './password-form.model';

type Model = Extract<ReturnType<typeof usePasswordFormModel>, { status: 'ready' }>;

const generateSuccessPageText = (userHasPassword: boolean, sessionSignOut: boolean) => {
  const localizedTexts = [];

  if (userHasPassword) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__update'));
  } else {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__set'));
  }

  if (sessionSignOut) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__signOutOfOtherSessions'));
  }

  return localizedTexts;
};

export const usePasswordFormController = (model: Model, { onSuccess, onReset }: PasswordFormProps) => {
  const { t, locale } = useLocalizations();
  const card = useCardState();
  // Ensure that messages will not use the updated state of User after a password has been set or changed
  const successPagePropsRef = useRef<Parameters<typeof SuccessPage>[0]>({
    title: localizationKeys('userProfile.passwordPage.title__set'),
  });

  const currentPasswordField = useFormControl('currentPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__currentPassword'),
    isRequired: true,
  });
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

  const canSubmit =
    (model.currentPasswordRequired ? currentPasswordField.value && isPasswordMatch : isPasswordMatch) &&
    passwordField.value &&
    confirmField.value;

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const onConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setConfirmPasswordFeedback(event.target.value);
    }
    return confirmField.props.onChange(event);
  };

  const updatePassword = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      successPagePropsRef.current = {
        title: model.passwordEnabled
          ? localizationKeys('userProfile.passwordPage.title__update')
          : localizationKeys('userProfile.passwordPage.title__set'),
        text: generateSuccessPageText(model.passwordEnabled, !!sessionsField.checked),
      };

      await model.updatePassword({
        newPassword: passwordField.value,
        signOutOfOtherSessions: sessionsField.checked,
        currentPassword: model.currentPasswordRequired ? currentPasswordField.value : undefined,
      });
      onSuccess();
    } catch (error: any) {
      handleError(error, [currentPasswordField, passwordField, confirmField], card.setError);
    }
  };

  return {
    title: model.passwordEnabled
      ? localizationKeys('userProfile.passwordPage.title__update')
      : localizationKeys('userProfile.passwordPage.title__set'),
    passwordEnabled: model.passwordEnabled,
    passwordEditDisabled: model.passwordEditDisabled,
    currentPasswordRequired: model.currentPasswordRequired,
    identifier: model.identifier,
    currentPasswordField: { id: currentPasswordField.id, props: currentPasswordField.props },
    passwordField: { id: passwordField.id, props: passwordField.props },
    confirmField: { id: confirmField.id, props: confirmField.props },
    sessionsField: { id: sessionsField.id, props: sessionsField.props },
    canSubmit: !!canSubmit,
    validateForm,
    onConfirmChange,
    updatePassword,
    onReset,
  };
};
