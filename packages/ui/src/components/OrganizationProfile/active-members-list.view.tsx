import type { ReactNode } from 'react';

import { Badge, Box, descriptors, localizationKeys, Td, Text } from '@/customizables';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import type {
  MemberPreview,
  MemberRowDisplay,
  MemberRowInteraction,
  MembersTableData,
} from './active-members-list.types';
import { DataTable, RoleSelect, RowContainer } from './MemberListTable';

export const ActiveMembersListView = ({ table, rows }: { table: MembersTableData; rows: ReactNode[] }) => (
  <DataTable
    {...table}
    emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.detailsTitle__emptyRow')}
    headers={[
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user') },
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__joined') },
      { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role') },
      {
        key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
        align: 'right',
      },
    ]}
    rows={rows}
  />
);

export const MemberRowView = ({
  data,
  preview,
  controller,
}: {
  data: MemberRowDisplay;
  preview: MemberPreview;
  controller: MemberRowInteraction;
}) => {
  const badge = preview.isCurrentUser ? (
    <Badge localizationKey={localizationKeys('badge__you')} />
  ) : preview.isDeprovisioned ? (
    <Badge
      colorScheme='secondary'
      localizationKey={localizationKeys('badge__deprovisioned')}
    />
  ) : preview.isBanned ? (
    <Badge
      colorScheme='danger'
      localizationKey={localizationKeys('badge__banned')}
    />
  ) : undefined;

  return (
    <RowContainer isDisabled={data.isDeprovisioned}>
      <Td>
        <UserPreviewView
          sx={{ maxWidth: '30ch' }}
          {...preview.display}
          subtitle={preview.identifier}
          subtitleProps={{ variant: 'caption' }}
          badge={badge}
        />
      </Td>
      <Td>
        <Box
          as='span'
          elementDescriptor={descriptors.formattedDate}
          elementId={descriptors.formattedDate.setId('tableCell')}
        >
          {data.date}
        </Box>
      </Td>
      <Td>
        {data.canManageMemberships ? (
          <RoleSelect
            isDisabled={controller.isRoleSelectDisabled}
            value={data.role}
            fallbackLabel={data.roleName}
            onChange={controller.onRoleChange}
            roles={data.options}
          />
        ) : (
          <Text sx={theme => ({ opacity: theme.opacity.$inactive })}>{data.localizedRoleLabel}</Text>
        )}
      </Td>
      <Td sx={{ textAlign: 'end' }}>
        {data.canManageMemberships && (
          <ThreeDotsMenu
            actions={[
              {
                label: localizationKeys('organizationProfile.membersPage.activeMembersTab.menuAction__remove'),
                isDestructive: true,
                onClick: controller.onRemove,
                isDisabled: controller.isRemoveDisabled,
              },
            ]}
            elementId='member'
          />
        )}
      </Td>
    </RowContainer>
  );
};
