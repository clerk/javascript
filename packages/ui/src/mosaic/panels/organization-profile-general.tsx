import { Box } from '../components/box';
import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { alpha } from '../utils';

export function OrganizationProfileGeneral() {
  return (
    <Box
      sx={t => ({
        width: '100%',
        containerType: 'inline-size',
      })}
    >
      <LeaveOrganization />
      <Box
        sx={t => ({
          height: '1px',
          background: `light-dark(${alpha('#000', 10)},${alpha('#fff', 10)})`,
          marginBlock: t.spacing(4),
        })}
      />
      <DeleteOrganization />
    </Box>
  );
}
