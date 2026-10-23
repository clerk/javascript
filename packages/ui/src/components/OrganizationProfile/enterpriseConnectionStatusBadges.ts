import type { LocalizationKey } from '../../customizables';
import { localizationKeys } from '../../customizables';
import type { OrganizationEnterpriseConnectionStatus } from '../ConfigureSSO/domain/organizationEnterpriseConnection';

export const STATUS_BADGES: Record<
  OrganizationEnterpriseConnectionStatus,
  { id: string; colorScheme: 'primary'; label: LocalizationKey }
> = {
  unconfigured: {
    id: 'unconfigured',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__unconfigured'),
  },
  in_progress: {
    id: 'inProgress',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inProgress'),
  },
  active: {
    id: 'active',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__active'),
  },
  inactive: {
    id: 'inactive',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inactive'),
  },
};
