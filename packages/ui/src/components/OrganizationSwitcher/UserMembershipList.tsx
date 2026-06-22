import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import React from 'react';

import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { filterExclusiveMemberships } from '@/ui/utils/filterExclusiveMemberships';

import { InfiniteListSpinner } from '../../common';
import { useOrganizationSwitcherContext } from '../../contexts';
import { Box, descriptors, localizationKeys } from '../../customizables';
import { useInView } from '../../hooks';
import { ArrowRight } from '../../icons';
import { common } from '../../styledSystem';
import { organizationListParams } from './utils';

export type UserMembershipListProps = {
  onPersonalWorkspaceClick: React.MouseEventHandler;
  onOrganizationClick: (org: OrganizationResource) => unknown;
};

const useFetchMemberships = () => {
  const { userMemberships } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView) {
        return;
      }
      if (userMemberships.hasNextPage) {
        userMemberships.fetchNext?.();
      }
    },
  });

  return {
    userMemberships,
    ref,
  };
};
export const UserMembershipList = (props: UserMembershipListProps) => {
  const { onPersonalWorkspaceClick, onOrganizationClick } = props;

  const { hidePersonal } = useOrganizationSwitcherContext();
  const { organization: currentOrg } = useOrganization();
  const { ref, userMemberships } = useFetchMemberships();
  const { user } = useUser();

  // Derive `hasExclusive` from the full, non-paginated membership set on the User resource so it never
  // fails open when the exclusive membership is not on the currently loaded page of `userMemberships`.
  const { hasExclusive } = filterExclusiveMemberships(user?.organizationMemberships ?? []);

  // The displayed list still filters the currently loaded page to exclusive-only, so a partially-loaded
  // page can never surface a non-exclusive organization.
  const loadedMemberships = (userMemberships.count || 0) > 0 ? userMemberships.data || [] : [];
  const { memberships: visibleMemberships } = filterExclusiveMemberships(loadedMemberships);

  const otherOrgs = visibleMemberships.map(e => e.organization).filter(o => o.id !== currentOrg?.id);

  // When the user has an exclusive membership, the personal workspace must always be hidden.
  const hidePersonalWorkspace = hidePersonal || hasExclusive;

  if (!user) {
    return null;
  }

  const { primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet, username, ...userWithoutIdentifiers } = user;

  const { isLoading } = userMemberships;
  // When the user has an exclusive membership we never load additional pages, so the infinite-scroll
  // observer must not keep paginating (a later page could otherwise surface non-exclusive orgs).
  const hasNextPage = hasExclusive ? false : userMemberships.hasNextPage;

  return (
    <Box
      sx={t => ({
        // 4 items + 4px border (four 1px borders)
        maxHeight: `calc((4 * ${t.sizes.$17}) + 4px)`,
        overflowY: 'auto',
        '> button,div': { border: `0 solid ${t.colors.$borderAlpha100}` },
        '>:not([hidden])~:not([hidden])': {
          borderTopWidth: '1px',
          borderBottomWidth: '0',
        },
        ...common.unstyledScrollbar(t),
      })}
      role='group'
      aria-label={hidePersonalWorkspace ? 'List of all organization memberships' : 'List of all accounts'}
    >
      {currentOrg && !hidePersonalWorkspace && (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          elementId={descriptors.organizationSwitcherPreviewButton.setId('personal')}
          icon={ArrowRight}
          onClick={onPersonalWorkspaceClick}
          role='menuitem'
        >
          <PersonalWorkspacePreview
            user={userWithoutIdentifiers}
            mainIdentifierVariant={'buttonLarge'}
            title={localizationKeys('organizationSwitcher.personalWorkspace')}
          />
        </PreviewButton>
      )}
      {otherOrgs.map(organization => (
        <PreviewButton
          key={organization.id}
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          elementId={descriptors.organizationSwitcherPreviewButton.setId('organization')}
          icon={ArrowRight}
          onClick={() => onOrganizationClick(organization)}
          role='menuitem'
          sx={t => ({
            border: `0 solid ${t.colors.$borderAlpha100}`,
          })}
        >
          <OrganizationPreview
            elementId='organizationSwitcherListedOrganization'
            organization={organization}
          />
        </PreviewButton>
      ))}
      {(hasNextPage || isLoading) && <InfiniteListSpinner ref={ref} />}
    </Box>
  );
};
