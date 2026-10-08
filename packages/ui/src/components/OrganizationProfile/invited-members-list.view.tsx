import type { ReactNode } from 'react';

import { Box, descriptors, localizationKeys, Td, Text } from '@/customizables';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import type { MembersTableData } from './active-members-list.types';
import type { InvitationRowDisplay, InvitationRowInteraction } from './invited-members-list.types';
import { DataTable, RowContainer } from './MemberListTable';

export const InvitedMembersListView = ({ table, rows }: { table: MembersTableData; rows: ReactNode[] }) => (
  <DataTable
    {...table}
    emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.invitationsTab.table__emptyRow')}
    headers={[
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user') },
      { key: localizationKeys('organizationProfile.membersPage.invitedMembersTab.tableHeader__invited') },
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role') },
      {
        key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
        align: 'right',
      },
    ]}
    rows={rows}
  />
);

export const InvitationRowView = ({
  data,
  controller,
}: {
  data: InvitationRowDisplay;
  controller: InvitationRowInteraction;
}) => (
  <RowContainer>
    <Td>
      <UserPreviewView
        sx={{ maxWidth: '30ch' }}
        identifier={data.emailAddress}
        subtitleProps={{ variant: 'caption' }}
      />
    </Td>
    <Td>
      <Box
        as='span'
        elementDescriptor={descriptors.formattedDate}
        elementId={descriptors.formattedDate.setId('tableCell')}
      >
        {data.invitedAt}
      </Box>
    </Td>
    <Td>
      <Text
        colorScheme='secondary'
        localizationKey={data.roleLabel}
      />
    </Td>
    <Td sx={{ textAlign: 'end' }}>
      <ThreeDotsMenu
        actions={[
          {
            label: localizationKeys('organizationProfile.membersPage.invitedMembersTab.menuAction__revoke'),
            isDestructive: true,
            onClick: controller.onRevoke,
            isDisabled: controller.isDisabled,
          },
        ]}
        elementId='invitation'
      />
    </Td>
  </RowContainer>
);
