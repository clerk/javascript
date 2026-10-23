import { useProfileSnapshot } from '@clerk/loom/handoff';

import {
  canAddIdentifications,
  toContactAccess,
  toContacts,
} from '../../features/user-profile/user-profile-contact.utils';
import type { EmailSectionState } from '../../features/user-profile/user-profile-email-section/user-profile-email-section.types';

export function useLoomProfileEmailsModel(): EmailSectionState | null {
  const { user, settings } = useProfileSnapshot();
  const eligibility = toContactAccess(
    {
      ...settings.emailAddress,
      used_for_first_factor: settings.emailAddress.usedForFirstFactor,
      used_for_second_factor: settings.emailAddress.usedForSecondFactor,
    },
    user.emailAddresses.length,
    canAddIdentifications(user, settings.enterpriseSsoEnabled),
  );
  if (!eligibility.show) {
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
  return { kind: 'snapshot', emails, eligibility };
}
