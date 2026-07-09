import type { FormEvent } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type { OrganizationProfileEnrollmentOption } from './organization-profile-domains-section.controller';
import type {
  OrganizationProfileDomainsSectionEnrollmentContext,
  OrganizationProfileDomainsSectionEnrollmentEvent,
} from './organization-profile-domains-section-enrollment.machine';

interface OrganizationProfileDomainsSectionEnrollmentViewProps {
  snapshot: Snapshot<OrganizationProfileDomainsSectionEnrollmentContext>;
  send: (event: OrganizationProfileDomainsSectionEnrollmentEvent) => void;
  canSubmit: boolean;
  enrollmentOptions: OrganizationProfileEnrollmentOption[];
}

export function OrganizationProfileDomainsSectionEnrollmentView({
  snapshot,
  send,
  canSubmit,
  enrollmentOptions,
}: OrganizationProfileDomainsSectionEnrollmentViewProps) {
  const isSaving = snapshot.value === 'saving';
  const isOpen = snapshot.value !== 'closed';
  const { domainName, committedEnrollmentMode, draftEnrollmentMode, deletePending, error } = snapshot.context;
  const { totalPendingInvitations, totalPendingSuggestions } = snapshot.context;

  const effectiveMode = draftEnrollmentMode ?? committedEnrollmentMode;
  const hasPending = totalPendingInvitations + totalPendingSuggestions > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) {
      send({ type: 'SUBMIT' });
    }
  };

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
            <Dialog.Title render={p => <Heading {...p} />}>Update {domainName}</Dialog.Title>
            <Dialog.Description render={p => <Text {...p} />}>
              Choose how users from this domain can join the organization.
            </Dialog.Description>

            {hasPending && (
              <Box
                sx={t => ({
                  ...t.text('sm'),
                  color: t.color.mutedForeground,
                  padding: t.spacing(3),
                  borderRadius: t.rounded.lg,
                  backgroundColor: t.alpha('primary', 5),
                })}
              >
                <Box render={p => <span {...p} />}>Changing the enrollment mode will only affect new users.</Box>
                <Box
                  render={p => <span {...p} />}
                  sx={{ display: 'block' }}
                >
                  Pending invitations sent to users: {totalPendingInvitations}
                </Box>
                <Box
                  render={p => <span {...p} />}
                  sx={{ display: 'block' }}
                >
                  Pending suggestions sent to users: {totalPendingSuggestions}
                </Box>
              </Box>
            )}

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
              <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
                {enrollmentOptions.map(option => (
                  <Box
                    key={option.value}
                    render={p => <label {...p} />}
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: t.spacing(2),
                      cursor: 'pointer',
                    })}
                  >
                    <input
                      type='radio'
                      name='enrollmentMode'
                      value={option.value}
                      checked={effectiveMode === option.value}
                      disabled={isSaving}
                      onChange={() => send({ type: 'SELECT_MODE', value: option.value })}
                    />
                    <Box>
                      <Box
                        render={p => <span {...p} />}
                        sx={t => ({ ...t.text('sm'), fontWeight: t.font.medium, display: 'block' })}
                      >
                        {option.label}
                      </Box>
                      <Box
                        render={p => <span {...p} />}
                        sx={t => ({ ...t.text('xs'), color: t.color.mutedForeground, display: 'block' })}
                      >
                        {option.description}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {effectiveMode === 'manual_invitation' && (
                <Box
                  render={p => <label {...p} />}
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing(2),
                    marginBlockStart: t.spacing(4),
                    ...t.text('sm'),
                    cursor: 'pointer',
                  })}
                >
                  <input
                    type='checkbox'
                    checked={deletePending}
                    disabled={isSaving}
                    onChange={e => send({ type: 'TOGGLE_DELETE_PENDING', checked: e.target.checked })}
                  />
                  Delete pending invitations and suggestions
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
                  disabled={isSaving}
                  onClick={() => send({ type: 'CANCEL' })}
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
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
