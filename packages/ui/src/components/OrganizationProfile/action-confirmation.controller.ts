import { useWizard } from '@/common';
import type { LocalizationKey } from '@/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { useOrganizationActionModel } from './organization-action.model';

export const useOrganizationActionController = (model: ReturnType<typeof useOrganizationActionModel>) => {
  const card = useCardState();

  return () =>
    card
      .runAsync(async () => {
        await model.perform();
      })
      .then(model.afterSuccess);
};

export const useActionConfirmationController = ({
  actionDescription,
  organizationName,
  onConfirmation,
}: {
  actionDescription: LocalizationKey;
  organizationName?: string;
  onConfirmation: () => Promise<any>;
}) => {
  const wizard = useWizard();
  const card = useCardState();
  const confirmationField = useFormControl('deleteOrganizationConfirmation', '', {
    type: 'text',
    label: actionDescription,
    isRequired: true,
    placeholder: organizationName,
  });
  const canSubmit = actionDescription ? confirmationField.value === organizationName : true;

  const onSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await onConfirmation().then(() => wizard.nextStep());
    } catch (error: any) {
      handleError(error, [], card.setError);
    }
  };

  return { wizardProps: wizard.props, confirmationField, canSubmit, onSubmit };
};
