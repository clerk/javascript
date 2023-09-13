import type { OrganizationDomainResource } from '@clerk/types';

import type { LocalizationKey } from '../../customizables';
import { Badge, localizationKeys } from '../../customizables';

const badgeLabelsMap: Record<OrganizationDomainResource['enrollmentMode'], LocalizationKey> = {
  manual_invitation: localizationKeys('organizationProfile.badge__manualInvitation'),
  automatic_invitation: localizationKeys('organizationProfile.badge__automaticInvitation'),
  automatic_suggestion: localizationKeys('organizationProfile.badge__automaticSuggestion'),
};

export const EnrollmentBadge = (props: { organizationDomain: OrganizationDomainResource | null }) => {
  const { organizationDomain } = props;
  if (!organizationDomain) {
    return null;
  }

  if (!(organizationDomain.verification && organizationDomain.verification.status === 'verified')) {
    return (
      <Badge
        localizationKey={localizationKeys('organizationProfile.badge__unverified')}
        textVariant={'extraSmallMedium'}
        colorScheme={'danger'}
      />
    );
  }

  return (
    <Badge
      localizationKey={badgeLabelsMap[organizationDomain.enrollmentMode]}
      colorScheme={organizationDomain.enrollmentMode === 'manual_invitation' ? 'neutral' : 'primary'}
      textVariant={'extraSmallMedium'}
    />
  );
};
