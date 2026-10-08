import type { ReactNode } from 'react';

import { Box, Button, descriptors, Flex, localizationKeys, Td } from '@/customizables';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import type { MembersTableData } from './active-members-list.types';
import { DataTable, RowContainer } from './MemberListTable';
import type { RequestRowDisplay, RequestRowInteraction } from './request-to-join-list.types';

export const RequestToJoinListView = ({ table, rows }: { table: MembersTableData; rows: ReactNode[] }) => (
  <DataTable
    {...table}
    emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.table__emptyRow')}
    headers={[
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user') },
      { key: localizationKeys('organizationProfile.membersPage.requestsTab.tableHeader__requested') },
      {
        key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
        align: 'right',
      },
    ]}
    rows={rows}
  />
);

export const RequestRowView = ({
  data,
  controller,
}: {
  data: RequestRowDisplay;
  controller: RequestRowInteraction;
}) => (
  <RowContainer>
    <Td>
      <UserPreviewView
        sx={{ maxWidth: '30ch' }}
        showAvatar={false}
        identifier={data.identifier}
        subtitleProps={{ variant: 'caption' }}
      />
    </Td>
    <Td>
      <Box
        as='span'
        elementDescriptor={descriptors.formattedDate}
        elementId={descriptors.formattedDate.setId('tableCell')}
      >
        {data.requestedAt}
      </Box>
    </Td>
    <Td sx={{ textAlign: 'end' }}>
      <Flex gap={2}>
        <Button
          textVariant='buttonSmall'
          variant='ghost'
          isLoading={controller.rejectIsLoading}
          isDisabled={controller.rejectIsDisabled}
          onClick={() => void controller.onReject()}
          localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__reject')}
        />
        <Button
          textVariant='buttonSmall'
          isLoading={controller.acceptIsLoading}
          isDisabled={controller.acceptIsDisabled}
          onClick={() => void controller.onAccept()}
          localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__approve')}
        />
      </Flex>
    </Td>
  </RowContainer>
);
