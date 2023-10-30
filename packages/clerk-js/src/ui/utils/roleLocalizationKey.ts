import type { MembershipRole } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const roleToLocalizationKey: Record<MembershipRole, LocalizationKey> = {
  basic_member: localizationKeys('membershipRole__basicMember'),
  guest_member: localizationKeys('membershipRole__guestMember'),
  admin: localizationKeys('membershipRole__admin'),
};

export const roleLocalizationKey = (role: MembershipRole | undefined): LocalizationKey | undefined => {
  if (!role) {
    return undefined;
  }
  return roleToLocalizationKey[role];
};

export const customRoleLocalizationKey = (role: MembershipRole | undefined): LocalizationKey | undefined => {
  if (!role) {
    return undefined;
  }
  return localizationKeys(`roles.${role}`);
};
