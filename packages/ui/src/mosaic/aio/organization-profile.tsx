import { Box } from '../components/box';
import { Tabs } from '../components/tabs';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { useMessages } from '../providers/localization-provider';
import { orgProfileBase } from './organization-profile.messages';

export function OrganizationProfile() {
  const m = useMessages('organizationProfile', orgProfileBase);
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
        {m.title}
      </Box>
      <Tabs.Root defaultValue='general'>
        <Tabs.List>
          <Tabs.Tab value='general'>{m.tab.general}</Tabs.Tab>
          <Tabs.Tab value='members'>{m.tab.members}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='general'>
          <OrganizationProfileGeneral />
        </Tabs.Panel>
        <Tabs.Panel value='members'>
          <Box
            render={p => <h1 {...p} />}
            sx={t => ({
              ...t.text('base'),
              fontWeight: t.font.medium,
              textAlign: 'center',
            })}
          >
            {m.membersContent}
          </Box>
        </Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}
