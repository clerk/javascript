import { Box } from '../components/box';
import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { alpha } from '../utils';

export function OrganizationProfile() {
  return (
    <Box
      sx={t => ({
        width: '100%',
      })}
    >
      <Box
        render={p => <h1 {...p} />}
        sx={t => ({
          ...t.text('lg'),
          fontWeight: t.font.semibold,
          marginBlockEnd: t.spacing(8),
        })}
      >
        Organization Profile
      </Box>
      <LeaveOrganization />
      <Box
        sx={t => ({
          height: '1px',
          background: alpha('#000', 10),
          marginBlock: t.spacing(4),
        })}
      />
      <DeleteOrganization />
    </Box>
  );
}
