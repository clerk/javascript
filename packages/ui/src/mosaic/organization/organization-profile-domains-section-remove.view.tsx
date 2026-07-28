import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type {
  OrganizationProfileDomainsSectionRemoveContext,
  OrganizationProfileDomainsSectionRemoveEvent,
} from './organization-profile-domains-section-remove.machine';

interface OrganizationProfileDomainsSectionRemoveViewProps {
  snapshot: Snapshot<OrganizationProfileDomainsSectionRemoveContext>;
  send: (event: OrganizationProfileDomainsSectionRemoveEvent) => void;
}

export function OrganizationProfileDomainsSectionRemoveView({
  snapshot,
  send,
}: OrganizationProfileDomainsSectionRemoveViewProps) {
  const isDeleting = snapshot.value === 'deleting';
  const isOpen = snapshot.value === 'confirming' || isDeleting;
  const { domainName, error } = snapshot.context;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          send({ type: 'CANCEL' });
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title render={p => <Heading {...p} />}>Remove domain</Dialog.Title>
            <Dialog.Description render={p => <Text {...p} />}>
              The domain &quot;{domainName}&quot; and its enrollment settings will be removed. Members already in the
              organization keep their access.
            </Dialog.Description>
            {error && (
              <Box
                role='alert'
                render={p => <p {...p} />}
                sx={t => ({
                  ...t.text('sm'),
                  color: t.color.destructive,
                  marginBlockStart: t.spacing(2),
                })}
              >
                {error}
              </Box>
            )}
            <Box
              sx={t => ({
                marginBlockStart: t.spacing(4),
                display: 'flex',
                columnGap: t.spacing(2),
              })}
            >
              <Button
                variant='outline'
                type='button'
                disabled={isDeleting}
                onClick={() => send({ type: 'CANCEL' })}
              >
                Cancel
              </Button>
              <Button
                intent='destructive'
                type='button'
                disabled={isDeleting}
                onClick={() => send({ type: 'CONFIRM' })}
              >
                Remove domain
              </Button>
            </Box>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
