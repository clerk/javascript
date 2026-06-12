import { Suspense } from 'react';

import { Box } from '../components/box';
import { SectionSkeleton } from '../components/section-skeleton';
import { Tabs } from '../components/tabs';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { OrganizationMembers } from '../sections/organization-members';

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
      <Tabs.Root defaultValue='general'>
        <Tabs.List>
          <Tabs.Tab value='general'>General</Tabs.Tab>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='general'>
          <OrganizationProfileGeneral />
        </Tabs.Panel>
        <Tabs.Panel value='members'>
          <Suspense fallback={<SectionSkeleton />}>
            <OrganizationMembers />
          </Suspense>
        </Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}
