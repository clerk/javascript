import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const roleToLocalizationKey: Record<string, LocalizationKey> = {
  /**
   * These are old role keys. We still need to support localization for those to avoid breaking labels in UI components for old instances.
   */
  basic_member: localizationKeys('membershipRole__basicMember'),
  guest_member: localizationKeys('membershipRole__guestMember'),
  admin: localizationKeys('membershipRole__admin'),
};

export const roleLocalizationKey = (role: string | undefined): LocalizationKey | undefined => {
  if (!role) {
    return undefined;
  }
  return roleToLocalizationKey[role];
};

export const customRoleLocalizationKey = (role: string | undefined): LocalizationKey | undefined => {
  if (!role) {
    return undefined;
  }
  return localizationKeys(`roles.${role}`);
};
