import type React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { useSignInFactorTwoBackupCodeModel } from './sign-in-factor-two-backup-code.model';

type SignInFactorTwoBackupCodeModel = ReturnType<typeof useSignInFactorTwoBackupCodeModel>;

export function useSignInFactorTwoBackupCodeController(model: SignInFactorTwoBackupCodeModel) {
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    return model.attempt(codeControl.value).catch(error => {
      if (model.canRun()) {
        handleError(error, [codeControl], card.setError);
      }
    });
  };

  return {
    isResettingPassword: model.isResettingPassword,
    error: card.error,
    codeControl,
    handleSubmit,
  };
}
