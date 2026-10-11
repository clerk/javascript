import type { ProfileSearchSection } from '../../components/profile';
import { useMessages } from '../../localization';
import type { OrganizationProfilePageId, OrganizationProfilePages } from './organization-profile.types';

export function useOrganizationProfileSearchSections(
  pages: OrganizationProfilePages,
): (page: OrganizationProfilePageId) => ProfileSearchSection[] | undefined {
  const profile = useMessages('organizationProfileProfileSection');
  const danger = useMessages('organizationProfileDangerSection');
  return page => {
    if (page !== 'general') {
      return undefined;
    }
    return [
      { id: 'profile', label: profile.sectionTitle },
      ...(pages.general.dangerSlot != null ? [{ id: 'danger', label: danger.sectionTitle }] : []),
    ];
  };
}
