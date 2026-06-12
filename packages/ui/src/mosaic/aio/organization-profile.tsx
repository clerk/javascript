import { Box } from '../components/box';
import { Tabs } from '../components/tabs';
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
      <Tabs.Root defaultValue='general'>
        <Tabs.List>
          <Tabs.Tab value='general'>General</Tabs.Tab>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='general'>
          <LeaveOrganization />
          <Box
            sx={t => ({
              height: '1px',
              background: alpha('#000', 10),
              marginBlock: t.spacing(4),
            })}
          />
          <DeleteOrganization />
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
