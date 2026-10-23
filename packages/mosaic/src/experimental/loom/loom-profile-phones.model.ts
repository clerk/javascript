import { useProfileSnapshot } from '@clerk/loom/handoff';

import {
  canAddIdentifications,
  toContactAccess,
  toContacts,
} from '../../features/user-profile/user-profile-contact.utils';
import type { PhoneSectionState } from '../../features/user-profile/user-profile-phone-section/user-profile-phone-section';

export function useLoomProfilePhonesModel(): PhoneSectionState | null {
  const { user, settings } = useProfileSnapshot();
  const attribute = settings.phoneNumber;
  if (!attribute) {
    return null;
  }
  if (!user.phoneNumbers) {
    throw new Error('Loom phone data is unavailable.');
  }
  const eligibility = toContactAccess(
    {
      ...attribute,
      used_for_first_factor: attribute.usedForFirstFactor,
      used_for_second_factor: attribute.usedForSecondFactor,
    },
    user.phoneNumbers.length,
    canAddIdentifications(user, settings.enterpriseSsoEnabled),
  );
  if (!eligibility.show) {
    return null;
  }
  const phones = toContacts(
    user.phoneNumbers.map(phone => ({
      ...phone,
      verification: {
        status: phone.verification?.status ?? null,
        expireAt: phone.verification?.expireAt == null ? null : new Date(phone.verification.expireAt),
      },
    })),
    user.primaryPhoneNumberId ?? null,
    phone => phone.phoneNumber,
  );
  return { kind: 'snapshot', phones, eligibility };
}
