import { useState } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Destructive } from '../block/destructive';
import { useOrganization } from '../data/use-organization';
import { useDeleteOrganization } from '../data/use-org-mutations';

export function DeleteOrganization() {
  const { organization } = useOrganization(); // signal — non-null inside the Suspense boundary
  const del = useDeleteOrganization(organization); // mutation — owns its own pending/error state
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
              color='destructive'
              {...props}
              sx={{
                flexShrink: 0,
              }}
            >
              Delete organization
            </Button>
          )}
          open={open}
          onOpenChange={setOpen}
          title='Delete organization'
          description='Are you sure you want to delete this organization?'
          resourceName={organization.name}
          primaryActionLabel='Delete organization'
          onDelete={() => del.mutate(undefined, { onSuccess: () => setOpen(false) })}
          isDeleting={del.isPending}
        />
      </Box>
    </Box>
  );
}
