import { useEffect, useRef } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

export const useResetConnectionDialogController = (
  confirmationValue: string,
  onDelete: () => Promise<unknown>,
  onClose: () => void,
  canRun: () => boolean,
) => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<object | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, []);
  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('configureSSO.resetConnectionDialog.confirmationFieldLabel', {
      name: confirmationValue,
    }),
    isRequired: true,
    placeholder: confirmationValue,
  });

  const canSubmit = Boolean(confirmationValue && confirmationField.value === confirmationValue);

  const confirmation = useRef(canSubmit);
  confirmation.current = canSubmit;

  const onSubmit = async () => {
    if (!mounted.current || pending.current || !confirmation.current || !canRun()) {
      return;
    }
    const request = {};
    pending.current = request;
    card.setError(undefined);
    try {
      await onDelete();
      if (mounted.current && pending.current === request && canRun()) {
        onClose();
      }
    } catch (err) {
      if (mounted.current && pending.current === request && canRun()) {
        handleError(err as Error, [confirmationField], card.setError);
      }
    } finally {
      if (pending.current === request) {
        pending.current = null;
      }
    }
  };

  return {
    confirmationFieldId: confirmationField.id,
    confirmationFieldProps: confirmationField.props,
    canSubmit,
    onSubmit,
  };
};
