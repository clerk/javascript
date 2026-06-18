import { useRef } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { SectionSkeleton } from '../components/section-skeleton';
import { Destructive } from '../block/destructive';
import { useOrganization } from '../mock/use-organization';
import { useMachine } from '../machine/useMachine';
import type { MockMembership, MockOrganization } from '../mock/use-organization';
import { createLeaveOrgMachine } from './leave-organization-machine';

export function LeaveOrganization() {
  const { isLoaded, organization, membership } = useOrganization();
  if (!isLoaded || !organization || !membership) return <SectionSkeleton />;
  return (
    <LeaveOrganizationReady
      organization={organization}
      membership={membership}
    />
  );
}

function LeaveOrganizationReady({
  organization,
  membership,
}: {
  organization: MockOrganization;
  membership: MockMembership;
}) {
  const membershipRef = useRef(membership);
  membershipRef.current = membership;
  const [snapshot, send] = useMachine(createLeaveOrgMachine(async () => membershipRef.current.destroy()));

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
            Leave organization
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
            You will be removed from the organization and need to be invited back
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
              Leave organization
            </Button>
          )}
          open={snapshot.value === 'confirming' || snapshot.value === 'leaving'}
          onOpenChange={isOpen => send({ type: isOpen ? 'OPEN' : 'CANCEL' })}
          title='Leave organization'
          description='Are you sure you want to leave this organization? You will lose access to this organization and its applications.'
          resourceName={organization.name}
          primaryActionLabel='Leave organization'
          onDelete={() => send({ type: 'CONFIRM' })}
          isDeleting={snapshot.value === 'leaving'}
        />
      </Box>
    </Box>
  );
}
