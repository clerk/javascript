import { useState } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Destructive } from '../block/destructive';
import { useOrganization } from '../data/use-organization';
import { useLeaveOrganization } from '../data/use-org-mutations';

export function LeaveOrganization() {
  const { organization, membership } = useOrganization(); // signal — non-null inside the Suspense boundary
  const leave = useLeaveOrganization(organization, membership); // mutation — owns its own pending/error state
  const [open, setOpen] = useState(false);

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
              color='destructive'
              {...props}
              sx={{
                flexShrink: 0,
              }}
            >
              Leave organization
            </Button>
          )}
          open={open}
          onOpenChange={setOpen}
          title='Leave organization'
          description='Are you sure you want to leave this organization? You will lose access to this organization and its applications.'
          resourceName={organization.name}
          primaryActionLabel='Leave organization'
          onDelete={() => leave.mutate(undefined, { onSuccess: () => setOpen(false) })}
          isDeleting={leave.isPending}
        />
      </Box>
    </Box>
  );
}
