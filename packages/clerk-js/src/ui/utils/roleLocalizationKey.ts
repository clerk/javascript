import type { MembershipRole } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const roleToLocalizationKey: Record<MembershipRole, LocalizationKey> = {
  basic_member: localizationKeys('membershipRole__basicMember'),
  guest_member: localizationKeys('membershipRole__guestMember'),
  admin: localizationKeys('membershipRole__admin'),
};

export const roleLocalizationKey = (role: MembershipRole): LocalizationKey => {
  return roleToLocalizationKey[role];
};
