import type { ReactElement, ReactNode } from 'react';

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

/**
 * The organization profile shell: a heading and a tabbed layout that hosts each
 * panel's content in the General, Members, and API keys tabs. Layout only — the
 * caller supplies each tab's panel via the `general`, `members`, and `apiKeys`
 * slots, so this component holds no data or Clerk state itself.
 */
export function OrganizationProfileView({ general, members, apiKeys }: OrganizationProfileViewProps): ReactElement {
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
