import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';

import type { PhoneSectionProps, usePhoneMenuModel, usePhoneSectionModel } from './phone-section.model';

export const usePhoneSectionController = (
  { shouldAllowCreation = true, shouldAllowDeletion = true }: PhoneSectionProps,
  model: ReturnType<typeof usePhoneSectionModel>,
) => {
  if (!shouldAllowCreation && model.phones.length === 0) {
    return { status: 'hidden' as const };
  }
  return { status: 'ready' as const, ...model, shouldAllowCreation, shouldAllowDeletion };
};

export const usePhoneMenuController = (
  model: ReturnType<typeof usePhoneMenuModel>,
  phoneId: string,
  shouldAllowDeletion = true,
) => {
  const card = useCardState();
  const { open } = useActionContext();

  if (model.status === 'hidden') {
    return { status: 'hidden' as const };
  }

  const actions = (
    [
      model.isPrimary && !model.isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__primary'),
            onClick: () => open(`verify-${phoneId}`),
          }
        : null,
      !model.isPrimary && model.isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__nonPrimary'),
            onClick: () => model.setPrimary().catch(error => handleError(error, [], card.setError)),
          }
        : null,
      !model.isPrimary && !model.isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__unverified'),
            onClick: () => open(`verify-${phoneId}`),
          }
        : null,
      shouldAllowDeletion
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.destructiveAction'),
            isDestructive: true,
            onClick: () => open(`remove-${phoneId}`),
          }
        : null,
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(action => action !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return { status: 'ready' as const, actions };
};
