import type { ReactNode } from 'react';

import { Box } from '../components/box';
import { alpha } from '../utils';

interface OrganizationProfileGeneralPanelViewProps {
  /** The organization-profile-leave-section section, rendered above the divider. */
  leaveOrganization: ReactNode;
  /** The organization-profile-delete-section section, rendered below the divider. */
  deleteOrganization: ReactNode;
}

export function OrganizationProfileGeneralPanelView({
  leaveOrganization,
  deleteOrganization,
}: OrganizationProfileGeneralPanelViewProps) {
  return (
    <Box
      sx={{
        width: '100%',
        containerType: 'inline-size',
      }}
    >
      {leaveOrganization}
      <Box
        sx={t => ({
          height: '1px',
          background: `light-dark(${alpha('#000', 10)},${alpha('#fff', 10)})`,
          marginBlock: t.spacing(4),
        })}
      />
      {deleteOrganization}
    </Box>
  );
}
