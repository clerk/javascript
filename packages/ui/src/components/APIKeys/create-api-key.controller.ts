import type { FormEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { CreateAPIKeyData, CreateAPIKeyFormProps, CreateAPIKeyModel, ExpirationOption } from './api-keys.types';
import { getTimeLeftInSeconds } from './utils';

export const useCreateAPIKeyController = (
  model: CreateAPIKeyModel,
  { onCreate }: CreateAPIKeyFormProps,
): CreateAPIKeyData => {
  const { expirationCaption: formatExpirationCaption } = model;
  const [selectedExpiration, setSelectedExpiration] = useState<ExpirationOption | null>(null);
  const expirationButtonRef = useRef<HTMLButtonElement>(null);
  const { close: closeCard } = useActionContext();
  const card = useCardState();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyName'),
    isRequired: true,
  });
  const descriptionField = useFormControl('apiKeyDescription', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyDescription'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyDescription'),
    isRequired: false,
  });
  const expirationCaption = useMemo(
    () => formatExpirationCaption(selectedExpiration?.value),
    [selectedExpiration?.value, formatExpirationCaption],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onCreate({
      name: nameField.value,
      description: descriptionField.value || undefined,
      secondsUntilExpiration: getTimeLeftInSeconds(selectedExpiration?.value),
    });
  };

  return {
    nameField: { id: nameField.id, props: nameField.props },
    descriptionField: { id: descriptionField.id, props: descriptionField.props },
    selectedExpiration,
    setSelectedExpiration,
    expirationButtonRef,
    expirationOptions: model.expirationOptions,
    expirationPlaceholder: model.expirationPlaceholder,
    expirationCaption,
    showDescription: model.showDescription,
    canSubmit: nameField.value.length > 2,
    isLoading: card.isLoading,
    closeCard,
    handleSubmit,
  };
};
