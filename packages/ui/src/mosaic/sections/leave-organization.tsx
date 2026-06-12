import { useState } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Destructive } from '../block/destructive';
import { useOrganization } from '../mock/use-organization';

export function LeaveOrganization() {
  const { isLoaded, organization, membership } = useOrganization();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isLoaded || !organization || !membership) {
    return <Box sx={t => ({ ...t.text('sm'), color: t.color.mutedForeground })}>Loading…</Box>;
  }

  const handleLeave = async () => {
    setIsDeleting(true);
    await membership.destroy();
    setIsDeleting(false);
    setOpen(false);
  };

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
          primaryActionLabel='Leave organization'
          resourceName={organization.name}
          onDelete={handleLeave}
          isDeleting={isDeleting}
        />
      </Box>
    </Box>
  );
}
