import type { FormEvent } from 'react';

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
          open={isOpen}
          onOpenChange={open => send({ type: open ? 'OPEN' : 'CANCEL' })}
          trigger={props => (
            <Button
              variant='outline'
              {...props}
              sx={{ flexShrink: 0 }}
              type='button'
            >
              Edit profile
            </Button>
          )}
        >
          <Dialog.Title render={p => <Heading {...p} />}>Update profile</Dialog.Title>
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
                value={nameValue}
                onChange={e => send({ type: 'TYPE_NAME', value: e.target.value })}
                disabled={isSaving}
                sx={t => ({ marginBlockStart: t.spacing(1) })}
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
                  sx={t => ({ marginBlockStart: t.spacing(1) })}
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
              <Button
                onClick={() => send({ type: 'CANCEL' })}
                variant='outline'
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={!canSubmit}
              >
                Save
              </Button>
            </Box>
          </form>
        </Dialog>
      </Box>
    </Box>
  );
}
