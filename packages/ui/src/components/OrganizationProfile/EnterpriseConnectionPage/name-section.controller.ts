import type React from 'react';

import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../../customizables';
import type { useNameSectionModel } from './name-section.model';

export const useNameFormController = (
  model: ReturnType<typeof useNameSectionModel>,
  { onSuccess, onReset }: { onSuccess: () => void; onReset: () => void },
) => {
  const card = useCardState();
  const nameField = useFormControl('name', model.name, {
    type: 'text',
    label: localizationKeys('organizationProfile.securityPage.connectionPage.name.title'),
    isRequired: true,
  });

  const name = nameField.value.trim();
  const canSubmit = name.length > 0 && name !== model.name;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || card.isLoading) {
      return;
    }
    try {
      await model.updateName(name);
      onSuccess();
    } catch (err) {
      handleError(err as Error, [nameField], card.setError);
    }
  };

  return { nameField, onSubmit, onReset, isDisabled: !canSubmit || card.isLoading };
};
