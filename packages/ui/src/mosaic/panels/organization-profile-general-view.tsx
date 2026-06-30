import type { ReactNode } from 'react';

import { Box } from '../components/box';
import { alpha } from '../utils';

interface OrganizationProfileGeneralViewProps {
  /** The leave-organization section, rendered above the divider. */
  leaveOrganization: ReactNode;
  /** The delete-organization section, rendered below the divider. */
  deleteOrganization: ReactNode;
}

export function OrganizationProfileGeneralView({
  leaveOrganization,
  deleteOrganization,
}: OrganizationProfileGeneralViewProps) {
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
