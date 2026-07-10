import type { ReactNode } from 'react';

import { Box } from '../components/box';
import { alpha } from '../utils';

interface OrganizationProfileGeneralPanelViewProps {
  /** The organization-profile-profile-section (name/slug), rendered at the top. */
  profile: ReactNode;
  /** The organization-profile-domains-section, rendered below the profile. */
  domains: ReactNode;
  /** The organization-profile-leave-section section. */
  leaveOrganization: ReactNode;
  /** The organization-profile-delete-section section, rendered below the divider. */
  deleteOrganization: ReactNode;
}

export function OrganizationProfileGeneralPanelView({
  profile,
  domains,
  leaveOrganization,
  deleteOrganization,
}: OrganizationProfileGeneralPanelViewProps) {
  const divider = (
    <Box
      sx={t => ({
        height: '1px',
        background: `light-dark(${alpha('#000', 10)},${alpha('#fff', 10)})`,
        marginBlock: t.spacing(4),
      })}
    />
  );

  return (
    <Box
      sx={{
        width: '100%',
        containerType: 'inline-size',
      }}
    >
      {profile}
      {divider}
      {domains}
      {divider}
      {leaveOrganization}
      {divider}
      {deleteOrganization}
    </Box>
  );
}
