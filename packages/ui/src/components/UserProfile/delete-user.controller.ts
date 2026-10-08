import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { DeleteUserFormProps, useDeleteUserModel } from './delete-user.model';

export const useDeleteUserController = (model: ReturnType<typeof useDeleteUserModel>, props: DeleteUserFormProps) => {
  const card = useCardState();
  const { t } = useLocalizations();
  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('userProfile.deletePage.actionDescription'),
    isRequired: true,
    placeholder: localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount'),
  });

  const canSubmit =
    confirmationField.value ===
    (t(localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount')) || 'Delete account');

  const deleteUser = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      return await model.deleteUser();
    } catch (error: any) {
      handleError(error, [], card.setError);
    }
  };

  return {
    confirmationField: { id: confirmationField.id, props: confirmationField.props },
    canSubmit,
    deleteUser,
    onReset: props.onReset,
  };
};
