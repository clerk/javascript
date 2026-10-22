import { useSuspenseProfile } from '@clerk/loom/react';

import {
  canAddIdentifications,
  toContactAccess,
  toContacts,
} from '../../features/user-profile/user-profile-contact.utils';
import { useUserProfileEmailActions } from '../../features/user-profile/user-profile-email-section/user-profile-email-section.model';
import type { EmailSectionState } from '../../features/user-profile/user-profile-email-section/user-profile-email-section.types';
import { useLoomProfileActionsContext } from './loom-profile-details.model';

export function useLoomProfileEmailsModel(): EmailSectionState | null {
  const { user, settings } = useSuspenseProfile();
  const actions = useUserProfileEmailActions(useLoomProfileActionsContext());
  const access = toContactAccess(
    {
      ...settings.emailAddress,
      used_for_first_factor: settings.emailAddress.usedForFirstFactor,
      used_for_second_factor: settings.emailAddress.usedForSecondFactor,
    },
    user.emailAddresses.length,
    canAddIdentifications(user, settings.enterpriseSsoEnabled),
  );
  if (!access.show) {
    return null;
  }
  const emails = toContacts(
    user.emailAddresses.map(email => ({
      ...email,
      verification: {
        status: email.verification?.status ?? null,
        expireAt: email.verification?.expireAt == null ? null : new Date(email.verification.expireAt),
      },
    })),
    user.primaryEmailAddressId,
    email => email.emailAddress,
  );
  if (actions.status !== 'ready') {
    return { kind: 'snapshot', emails, eligibility: access };
  }
  return {
    kind: 'interactive',
    model: {
      ...actions,
      userId: user.id,
      username: user.username ?? undefined,
      emails,
      eligibility: access,
      onCreateEmail: access.canCreate ? actions.onCreateEmail : undefined,
      onRemoveEmail: access.canRemove ? actions.onRemoveEmail : undefined,
    },
  };
}
