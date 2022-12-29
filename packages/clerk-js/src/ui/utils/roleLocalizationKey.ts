import { MembershipRole } from '@clerk/types';

import { LocalizationKey, localizationKeys } from '../localization/localizationKeys';

const roleToLocalizationKey: Record<MembershipRole, LocalizationKey> = {
  basic_member: localizationKeys('membershipRole__basicMember'),
  guest_member: localizationKeys('membershipRole__guestMember'),
  admin: localizationKeys('membershipRole__admin'),
};

export const roleLocalizationKey = (role: MembershipRole): LocalizationKey => {
  return roleToLocalizationKey[role];
};
