import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { useUserVerificationFactorOnePasswordModel } from './user-verification-factor-one-password.model';

export const useUserVerificationFactorOnePasswordController = (
  model: ReturnType<typeof useUserVerificationFactorOnePasswordModel>,
) => {
  const card = useCardState();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(value => !value), [setShowHavingTrouble]);
  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });

  const handlePasswordSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    return model
      .verifyPassword(passwordControl.value)
      ?.catch(error => handleError(error, [passwordControl], card.setError));
  };

  return {
    showHavingTrouble,
    toggleHavingTrouble,
    passwordControl,
    handlePasswordSubmit,
    error: card.error,
  };
};
