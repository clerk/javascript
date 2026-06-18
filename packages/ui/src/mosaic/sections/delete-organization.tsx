import { useRef } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { SectionSkeleton } from '../components/section-skeleton';
import { Destructive } from '../block/destructive';
import { useOrganization } from '../mock/use-organization';
import { useMachine } from '../machine/useMachine';
import type { MockOrganization } from '../mock/use-organization';
import { createDeleteOrgMachine } from './delete-organization-machine';

export function DeleteOrganization() {
  const { isLoaded, organization } = useOrganization();
  if (!isLoaded || !organization) return <SectionSkeleton />;
  return <DeleteOrganizationReady organization={organization} />;
}

function DeleteOrganizationReady({ organization }: { organization: MockOrganization }) {
  const organizationRef = useRef(organization);
  organizationRef.current = organization;
  const [snapshot, send] = useMachine(createDeleteOrgMachine(async () => organizationRef.current.destroy()));

  return (
    <Box
      sx={t => ({
        width: '100%',
        containerType: 'inline-size',
      })}
    >
      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          columnGap: t.spacing(10),
          rowGap: t.spacing(4),
          '@container (min-width: 600px)': {
            flexDirection: 'row',
          },
        })}
      >
        <Box>
          <Box
            render={p => <h2 {...p} />}
            sx={t => ({
              ...t.text('base'),
              fontWeight: t.font.semibold,
            })}
          >
            Delete organization
          </Box>
          <Box
            render={p => <p {...p} />}
            sx={t => ({
              ...t.text('sm'),
              textWrap: 'balance',
              marginBlockStart: t.spacing(1),
              color: t.color.mutedForeground,
            })}
          >
            Your organization will be permanently deleted and all members will lose access
          </Box>
        </Box>
        <Destructive
          trigger={props => (
            <Button
              intent='destructive'
              {...props}
              sx={{
                flexShrink: 0,
              }}
            >
              Delete organization
            </Button>
          )}
          open={snapshot.value === 'confirming' || snapshot.value === 'deleting'}
          onOpenChange={isOpen => send({ type: isOpen ? 'OPEN' : 'CANCEL' })}
          title='Delete organization'
          description='Are you sure you want to delete this organization?'
          resourceName={organization.name}
          primaryActionLabel='Delete organization'
          onDelete={() => send({ type: 'CONFIRM' })}
          isDeleting={snapshot.value === 'deleting'}
        />
      </Box>
    </Box>
  );
}
