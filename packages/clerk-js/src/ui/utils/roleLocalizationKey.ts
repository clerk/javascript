import { OrganizationMembershipRole } from '../../../../backend-core/src/api/resources';
import { LocalizationKey, localizationKeys } from '../localization/localizationKeys';

const roleToLocalizationKey: Record<OrganizationMembershipRole, LocalizationKey> = {
  basic_member: localizationKeys('membershipRole__basicMember'),
  guest_member: localizationKeys('membershipRole__guestMember'),
  admin: localizationKeys('membershipRole__admin'),
};

export const roleLocalizationKey = (role: OrganizationMembershipRole): LocalizationKey => {
  return roleToLocalizationKey[role];
};
