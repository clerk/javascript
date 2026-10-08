import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';
import { createUsernameError } from '@/ui/utils/usernameUtils';

import type { UsernameFormProps, useUsernameFormModel } from './username-form.model';

type Model = Extract<ReturnType<typeof useUsernameFormModel>, { status: 'ready' }>;

export const useUsernameFormController = (model: Model, { onSuccess, onReset }: UsernameFormProps) => {
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const usernameField = useFormControl('username', model.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    buildErrorMessage: errors => createUsernameError(errors, { t, locale, usernameSettings: model.usernameSettings }),
  });

  const canSubmit =
    (model.isUsernameRequired ? usernameField.value.length > 0 : true) && model.username !== usernameField.value;

  const submitUpdate = async () => {
    try {
      await model.updateUsername(usernameField.value);
      onSuccess();
    } catch (error: any) {
      handleError(error, [usernameField], card.setError);
    }
  };

  return {
    status: 'ready' as const,
    username: model.username,
    isUsernameRequired: model.isUsernameRequired,
    usernameField: { id: usernameField.id, props: usernameField.props },
    canSubmit,
    submitUpdate,
    onReset,
  };
};
