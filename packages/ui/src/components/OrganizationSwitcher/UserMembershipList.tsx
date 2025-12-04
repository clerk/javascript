import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import React from 'react';

import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { InfiniteListSpinner } from '../../common';
import { useOrganizationSwitcherContext } from '../../contexts';
import { Box, descriptors, localizationKeys } from '../../customizables';
import { useInView } from '../../hooks';
import { SwitchArrowRight } from '../../icons';
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

  const otherOrgs = ((userMemberships.count || 0) > 0 ? userMemberships.data || [] : [])
    .map(e => e.organization)
    .filter(o => o.id !== currentOrg?.id);

  if (!user) {
    return null;
  }

  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  const { isLoading, hasNextPage } = userMemberships;

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
      aria-label={hidePersonal ? 'List of all organization memberships' : 'List of all accounts'}
    >
      {currentOrg && !hidePersonal && (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          elementId={descriptors.organizationSwitcherPreviewButton.setId('personal')}
          icon={SwitchArrowRight}
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
          icon={SwitchArrowRight}
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
