import { isPasswordCompromisedError, isPasswordPwnedError } from '@clerk/shared/error';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { useSignInFactorOnePasswordModel } from './sign-in-factor-one-password.model';
import type { PasswordErrorCode } from './SignInFactorOnePasswordCard';

type SignInFactorOnePasswordModel = ReturnType<typeof useSignInFactorOnePasswordModel>;

type PasswordControllerOptions = {
  onForgotPasswordMethodClick: React.MouseEventHandler | undefined;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onPasswordError?: (errorCode: PasswordErrorCode) => void;
};

export function useSignInFactorOnePasswordController(
  model: SignInFactorOnePasswordModel,
  props: PasswordControllerOptions,
) {
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const focusTimer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => () => clearTimeout(focusTimer.current), [model.requestKey]);
  const card = useCardState();
  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(value => !value), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    return model.attempt(passwordControl.value).catch(error => {
      if (!model.canRun()) {
        return;
      }
      if (props.onPasswordError) {
        if (isPasswordPwnedError(error)) {
          card.setError({ ...error.errors[0], code: 'form_password_pwned__sign_in' });
          props.onPasswordError('pwned');
          return;
        }
        if (isPasswordCompromisedError(error)) {
          card.setError({ ...error.errors[0], code: 'form_password_compromised__sign_in' });
          props.onPasswordError('compromised');
          return;
        }
      }

      handleError(error, [passwordControl], card.setError);
      clearTimeout(focusTimer.current);
      focusTimer.current = setTimeout(() => {
        if (model.canRun()) {
          passwordInputRef.current?.focus();
        }
      }, 0);
    });
  };

  return {
    identifier: model.identifier,
    avatarUrl: model.avatarUrl,
    error: card.error,
    goBack: model.goBack,
    passwordControl: {
      ...passwordControl,
      props: {
        ...passwordControl.props,
        actionLabel:
          model.hasResetPasswordFactor || props.onShowAlternativeMethodsClick
            ? localizationKeys('formFieldAction__forgotPassword')
            : '',
        onActionClicked: props.onForgotPasswordMethodClick
          ? props.onForgotPasswordMethodClick
          : props.onShowAlternativeMethodsClick
            ? props.onShowAlternativeMethodsClick
            : () => null,
      },
    },
    passwordInputRef,
    showHavingTrouble,
    toggleHavingTrouble,
    handleSubmit,
  };
}
