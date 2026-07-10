import type { ReactNode } from 'react';

import { Box } from '../components/box';
import { Tabs } from '../components/tabs';

interface OrganizationProfileViewProps {
  /** The General tab's panel content. */
  general: ReactNode;
  /** The Members tab's panel content. */
  members: ReactNode;
  /** The API keys tab's panel content. */
  apiKeys: ReactNode;
}

export function OrganizationProfileView({ general, members, apiKeys }: OrganizationProfileViewProps) {
  return (
    <Box
      sx={{
        width: '100%',
      }}
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
          <Tabs.Tab value='api-keys'>API keys</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='general'>{general}</Tabs.Panel>
        <Tabs.Panel value='members'>{members}</Tabs.Panel>
        <Tabs.Panel value='api-keys'>{apiKeys}</Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}
