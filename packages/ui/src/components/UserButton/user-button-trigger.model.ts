import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';

import { useUserButtonContext } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { userButtonMessages } from './user-button.messages';
import type { UserButtonIdentifierData, UserButtonTriggerData } from './user-button.types';

export const useUserButtonTriggerModel = (isOpen: boolean): UserButtonTriggerData => {
  const { user } = useUser();
  const { showName } = useUserButtonContext();
  const { t } = useLocalizations();

  return {
    showName,
    identifier: user && showName ? getFullName(user) || getIdentifier(user) : undefined,
    avatar: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }
      : undefined,
    ariaLabel: t(isOpen ? userButtonMessages.trigger.close : userButtonMessages.trigger.open),
  };
};

export const useUserButtonIdentifierModel = (showName: boolean | undefined): UserButtonIdentifierData => {
  const { user } = useUser();

  return { identifier: user && showName ? getFullName(user) || getIdentifier(user) : undefined };
};
