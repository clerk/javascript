import type { OrganizationDomainResource } from '@clerk/shared/types';

import type { LocalizationKey } from '../../customizables';
import { Badge, localizationKeys } from '../../customizables';

const badgeLabelsMap: Record<OrganizationDomainResource['enrollmentMode'], LocalizationKey> = {
  manual_invitation: localizationKeys('organizationProfile.badge__manualInvitation'),
  automatic_invitation: localizationKeys('organizationProfile.badge__automaticInvitation'),
  automatic_suggestion: localizationKeys('organizationProfile.badge__automaticSuggestion'),
  enterprise_sso: localizationKeys('organizationProfile.badge__enterpriseSso'),
};

export const EnrollmentBadge = (props: { organizationDomain: OrganizationDomainResource | null }) => {
  const { organizationDomain } = props;
  if (!organizationDomain) {
    return null;
  }

  const isVerified =
    organizationDomain.ownershipVerification?.status === 'verified' ||
    organizationDomain.verification?.status === 'verified';

  if (!isVerified) {
    return (
      <Badge
        localizationKey={localizationKeys('organizationProfile.badge__unverified')}
        colorScheme='warning'
      />
    );
  }

  return (
    <Badge
      localizationKey={badgeLabelsMap[organizationDomain.enrollmentMode]}
      colorScheme={organizationDomain.enrollmentMode === 'manual_invitation' ? 'primary' : 'success'}
    />
  );
};
