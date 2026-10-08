import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';

import type { EmailsSectionProps, useEmailMenuModel, useEmailsSectionModel } from './emails-section.model';

export const useEmailsSectionController = (
  { shouldAllowCreation = true, shouldAllowDeletion = true }: EmailsSectionProps,
  model: ReturnType<typeof useEmailsSectionModel>,
) => {
  return { ...model, shouldAllowCreation, shouldAllowDeletion };
};

export const useEmailMenuController = (
  model: ReturnType<typeof useEmailMenuModel>,
  emailId: string,
  shouldAllowDeletion = true,
) => {
  const card = useCardState();
  const { open } = useActionContext();
  const actions = (
    [
      model.isPrimary && !model.isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__primary'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      !model.isPrimary && model.isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__nonPrimary'),
            onClick: () => {
              model.setPrimary().catch(error => handleError(error, [], card.setError));
            },
          }
        : null,
      !model.isPrimary && !model.isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__unverified'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      shouldAllowDeletion
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.destructiveAction'),
            isDestructive: true,
            onClick: () => open(`remove-${emailId}`),
          }
        : null,
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(action => action !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return { actions };
};
