import { Destructive } from '../block/destructive';
import { Box } from '../components/box';
import { Button } from '../components/button';
import type { Snapshot } from '../machine/types';
import type {
  OrganizationProfileLeaveSectionContext,
  OrganizationProfileLeaveSectionEvent,
} from './organization-profile-leave-section.machine';

interface OrganizationProfileLeaveSectionViewProps {
  snapshot: Snapshot<OrganizationProfileLeaveSectionContext>;
  send: (event: OrganizationProfileLeaveSectionEvent) => void;
  canSubmit: boolean;
}

export function OrganizationProfileLeaveSectionView({
  snapshot,
  send,
  canSubmit,
}: OrganizationProfileLeaveSectionViewProps) {
  const isLeaving = snapshot.value === 'leaving';

  return (
    <Box sx={{ width: '100%', containerType: 'inline-size' }}>
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
          open={snapshot.value === 'confirming' || isLeaving}
          onOpenChange={isOpen => send({ type: isOpen ? 'OPEN' : 'CANCEL' })}
          title='Leave organization'
          description='Are you sure you want to leave this organization? You will lose access to this organization and its applications.'
          resourceName={snapshot.context.organizationName}
          confirmationValue={snapshot.context.confirmationValue}
          onConfirmationValueChange={value => send({ type: 'TYPE_CONFIRMATION', value })}
          primaryActionLabel='Leave organization'
          onDelete={() => send({ type: 'CONFIRM' })}
          isDeleting={isLeaving}
          canSubmit={canSubmit}
          error={snapshot.context.error}
        />
      </Box>
    </Box>
  );
}
