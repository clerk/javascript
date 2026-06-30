import { Destructive } from '../block/destructive';
import { Box } from '../components/box';
import { Button } from '../components/button';
import type { Snapshot } from '../machine/types';
import type { DeleteOrgContext, DeleteOrgEvent } from './delete-organization-machine';

interface DeleteOrganizationViewProps {
  snapshot: Snapshot<DeleteOrgContext>;
  send: (event: DeleteOrgEvent) => void;
  canSubmit: boolean;
}

export function DeleteOrganizationView({ snapshot, send, canSubmit }: DeleteOrganizationViewProps) {
  const isDeleting = snapshot.value === 'deleting';

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
          open={snapshot.value === 'confirming' || isDeleting}
          onOpenChange={isOpen => send({ type: isOpen ? 'OPEN' : 'CANCEL' })}
          title='Delete organization'
          description='Are you sure you want to delete this organization?'
          resourceName={snapshot.context.organizationName}
          confirmationValue={snapshot.context.confirmationValue}
          onConfirmationValueChange={value => send({ type: 'TYPE_CONFIRMATION', value })}
          primaryActionLabel='Delete organization'
          onDelete={() => send({ type: 'CONFIRM' })}
          isDeleting={isDeleting}
          canSubmit={canSubmit}
          error={snapshot.context.error}
        />
      </Box>
    </Box>
  );
}
