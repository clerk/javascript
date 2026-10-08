import type { localizationKeys } from '@/customizables';

import type { SSODomain } from '../configure-sso.types';
import { isOrganizationDomainVerified } from '../domain/organizationEnterpriseConnection';
import { DomainCardView } from './domain-card.view';

type DomainCardProps = {
  domain: SSODomain;
  isSelected: boolean;
  claimedBy: string | undefined;
  onToggle: (checked: boolean) => void;
  isToggleDisabled?: boolean;
  onRemove: () => void;
  onPrepareOwnershipVerification: () => Promise<void>;
  isRemoveDisabled?: boolean;
  removeDisabledTooltip?: ReturnType<typeof localizationKeys>;
};

export const DomainCard = ({ domain, ...props }: DomainCardProps): JSX.Element | null => {
  const isVerified = isOrganizationDomainVerified(domain);
  // Only a verified domain no other connection claims can join this one.
  const isSelectable = isVerified && (!props.claimedBy || props.isSelected);
  return (
    <DomainCardView
      {...props}
      domainName={domain.name}
      ownershipVerification={domain.ownershipVerification}
      isVerified={isVerified}
      isExpired={domain.ownershipVerification?.status === 'expired'}
      cardId={domain.ownershipVerification?.status ?? 'unverified'}
      isSelectable={isSelectable}
    />
  );
};
