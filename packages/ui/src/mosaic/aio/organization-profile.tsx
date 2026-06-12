import { Box } from '../components/box';
import { Tabs } from '../components/tabs';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';

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
          <Box
            render={p => <h1 {...p} />}
            sx={t => ({
              ...t.text('base'),
              fontWeight: t.font.medium,
              textAlign: 'center',
            })}
          >
            Members content
          </Box>
        </Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}
