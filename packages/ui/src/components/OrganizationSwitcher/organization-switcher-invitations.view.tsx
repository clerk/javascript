import type { PropsWithChildren, ReactNode } from 'react';

import { Actions } from '@/ui/elements/Actions';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';

import { InfiniteListSpinner } from '../../common';
import { Box, descriptors, Flex } from '../../customizables';
import { common } from '../../styledSystem';
import type {
  OrganizationSwitcherInvitationOrganization,
  OrganizationSwitcherInvitationsDisplayData,
} from './organization-switcher-invitations.types';

export const OrganizationSwitcherInvitationPreview = (
  props: PropsWithChildren<{ organizationData: OrganizationSwitcherInvitationOrganization }>,
) => (
  <Flex
    align='center'
    gap={2}
    sx={t => ({
      justifyContent: 'space-between',
      padding: `${t.space.$4} ${t.space.$5}`,
    })}
    elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActionsBox}
  >
    <OrganizationPreview
      elementId='organizationSwitcherListedOrganization'
      organization={props.organizationData}
      sx={t => ({
        color: t.colors.$colorMutedForeground,
        ':hover': { color: t.colors.$colorMutedForeground },
      })}
    />
    {props.children}
  </Flex>
);

export const OrganizationSwitcherInvitationsView = ({
  isVisible,
  invitationHasNextPage,
  hasNextPage,
  isLoading,
  paginationRef,
  invitationRows,
  suggestionRows,
}: OrganizationSwitcherInvitationsDisplayData & {
  invitationRows: ReactNode;
  suggestionRows: ReactNode;
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Actions elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActions}>
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$17} + 4px)`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {invitationRows}
        {!invitationHasNextPage && suggestionRows}
        {(hasNextPage || isLoading) && <InfiniteListSpinner ref={paginationRef} />}
      </Box>
    </Actions>
  );
};
