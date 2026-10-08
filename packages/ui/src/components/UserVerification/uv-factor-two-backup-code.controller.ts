import type React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { useUVFactorTwoBackupCodeModel } from './uv-factor-two-backup-code.model';

export const useUVFactorTwoBackupCodeController = (model: ReturnType<typeof useUVFactorTwoBackupCodeModel>) => {
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });

  const handleBackupCodeSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    return model.verifyBackupCode(codeControl.value).catch(error => handleError(error, [codeControl], card.setError));
  };

  return { codeControl, handleBackupCodeSubmit, error: card.error };
};
