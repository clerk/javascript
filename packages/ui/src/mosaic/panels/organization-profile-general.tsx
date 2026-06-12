import { Suspense } from 'react';

import { Box } from '../components/box';
import { SectionSkeleton } from '../components/section-skeleton';
import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { alpha } from '../utils';

function Divider() {
  return (
    <Box
      sx={t => ({
        height: '1px',
        background: `light-dark(${alpha('#000', 10)},${alpha('#fff', 10)})`,
        marginBlock: t.spacing(4),
      })}
    />
  );
}

export function OrganizationProfileGeneral() {
  return (
    <Box
      sx={t => ({
        width: '100%',
        containerType: 'inline-size',
      })}
    >
      {/* One boundary owns loading for the whole panel — both sections suspend on the shared
          org-hydration promise and resume on the same tick, no per-section `isLoaded` branch. */}
      <Suspense
        fallback={
          <>
            <SectionSkeleton />
            <Divider />
            <SectionSkeleton />
          </>
        }
      >
        <LeaveOrganization />
        <Divider />
        <DeleteOrganization />
      </Suspense>
    </Box>
  );
}
