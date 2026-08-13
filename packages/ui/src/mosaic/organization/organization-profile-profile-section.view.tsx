import type { FormEvent } from 'react';
import { useMemo, useRef } from 'react';

import { AlertDialog, createConfirmHandle, useConfirmedClose } from '../components/alert-dialog';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import type { Snapshot } from '../machine/types';
import type {
  OrganizationProfileProfileSectionDetailsContext,
  OrganizationProfileProfileSectionDetailsEvent,
} from './organization-profile-profile-section-details.machine';
import { hasUnsavedEdits } from './organization-profile-profile-section-details.machine';

interface OrganizationProfileProfileSectionViewProps {
  snapshot: Snapshot<OrganizationProfileProfileSectionDetailsContext>;
  send: (event: OrganizationProfileProfileSectionDetailsEvent) => void;
  canSubmit: boolean;
}

export function OrganizationProfileProfileSectionView({
  snapshot,
  send,
  canSubmit,
}: OrganizationProfileProfileSectionViewProps) {
  const { committedName, committedSlug, draftName, draftSlug, slugEnabled, error } = snapshot.context;
  const isSaving = snapshot.value === 'saving';
  const isOpen = snapshot.value !== 'closed';

  // The draft holds the user's edits; a null draft falls through to the committed value.
  const nameValue = draftName ?? committedName;
  const slugValue = draftSlug ?? committedSlug;

  const confirm = useMemo(() => createConfirmHandle(), []);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Closing this form used to discard the edits silently — Escape, or the corner X, and the typing
  // was gone. Every close the dialog owns funnels through here, so one guard covers them all.
  //
  // Not asked while saving: `CANCEL` is not a transition the `saving` state accepts, so the dialog
  // stays open regardless, and a question whose answer changes nothing is worse than no question.
  const onOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => !isSaving && hasUnsavedEdits(snapshot.context),
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    confirm: {
      title: 'Discard changes?',
      description: 'The edits to this profile have not been saved.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) {
      send({ type: 'SUBMIT' });
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        containerType: 'inline-size',
      }}
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
            {committedName}
          </Box>
          {slugEnabled && committedSlug && (
            <Box
              render={p => <p {...p} />}
              sx={t => ({
                ...t.text('sm'),
                marginBlockStart: t.spacing(1),
                color: t.color.mutedForeground,
              })}
            >
              {committedSlug}
            </Box>
          )}
        </Box>
        <Dialog
          closedBy='closerequest'
          open={isOpen}
          onOpenChange={onOpenChange}
          trigger={props => (
            <Button
              variant='outline'
              {...props}
              style={{ flexShrink: 0 }}
              type='button'
            >
              Edit profile
            </Button>
          )}
        >
          <Dialog.Title render={<Heading />}>Update profile</Dialog.Title>
          {error && (
            <Box
              role='alert'
              render={p => <p {...p} />}
              sx={t => ({
                ...t.text('sm'),
                color: t.color.destructive,
              })}
            >
              {error}
            </Box>
          )}
          <form onSubmit={handleSubmit}>
            <Box
              render={p => <label {...p} />}
              sx={t => ({
                ...t.text('sm'),
                fontWeight: t.font.medium,
                display: 'block',
              })}
            >
              Name
              <Input
                ref={nameInputRef}
                value={nameValue}
                onChange={e => send({ type: 'TYPE_NAME', value: e.target.value })}
                disabled={isSaving}
                style={{ marginBlockStart: 'var(--cl-spacing)' }}
              />
            </Box>
            {slugEnabled && (
              <Box
                render={p => <label {...p} />}
                sx={t => ({
                  ...t.text('sm'),
                  fontWeight: t.font.medium,
                  display: 'block',
                  marginBlockStart: t.spacing(4),
                })}
              >
                Slug
                <Input
                  value={slugValue}
                  onChange={e => send({ type: 'TYPE_SLUG', value: e.target.value })}
                  disabled={isSaving}
                  style={{ marginBlockStart: 'var(--cl-spacing)' }}
                />
              </Box>
            )}
            <Box
              sx={t => ({
                marginBlockStart: t.spacing(4),
                display: 'flex',
                columnGap: t.spacing(2),
              })}
            >
              {/* `Dialog.Close`, not a bare `send({ type: 'CANCEL' })`. A button that closes the
                  form itself goes around `onOpenChange`, which is where the unsaved-edits guard
                  lives — this was the one way out that discarded the edits without asking. */}
              <Dialog.Close
                render={
                  <Button
                    variant='outline'
                    disabled={isSaving}
                  />
                }
              >
                Cancel
              </Dialog.Close>
              <Button
                type='submit'
                disabled={!canSubmit}
              >
                Save
              </Button>
            </Box>
          </form>
          <AlertDialog.Confirm
            handle={confirm}
            finalFocus={nameInputRef}
          />
        </Dialog>
      </Box>
    </Box>
  );
}
