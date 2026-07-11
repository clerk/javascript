import type { FormEvent } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type { OrganizationProfileEnrollmentOption } from './organization-profile-domains-section.controller';
import type {
  OrganizationProfileDomainsSectionAddVerifyContext,
  OrganizationProfileDomainsSectionAddVerifyEvent,
} from './organization-profile-domains-section-add-verify.machine';

interface OrganizationProfileDomainsSectionAddVerifyViewProps {
  snapshot: Snapshot<OrganizationProfileDomainsSectionAddVerifyContext>;
  send: (event: OrganizationProfileDomainsSectionAddVerifyEvent) => void;
  enrollmentOptions: OrganizationProfileEnrollmentOption[];
}

export function OrganizationProfileDomainsSectionAddVerifyView({
  snapshot,
  send,
  enrollmentOptions,
}: OrganizationProfileDomainsSectionAddVerifyViewProps) {
  const { value } = snapshot;
  const { domainName, draftName, draftEmail, draftCode, selectedEnrollmentMode, error } = snapshot.context;

  const isOpen = value !== 'closed';
  const isNameStep = value === 'enteringName' || value === 'creating';
  const isEmailStep = value === 'enteringEmail' || value === 'preparing';
  const isCodeStep = value === 'enteringCode' || value === 'attempting';
  const isEnrollmentStep = value === 'selectingEnrollment' || value === 'savingEnrollment';
  const isBusy =
    value === 'creating' || value === 'preparing' || value === 'attempting' || value === 'savingEnrollment';

  const title = isNameStep ? 'Add domain' : isEnrollmentStep ? `Update ${domainName}` : 'Verify domain';

  const onSubmit = (event: FormEvent, run: () => void) => {
    event.preventDefault();
    run();
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
            <Dialog.Title render={p => <Heading {...p} />}>{title}</Dialog.Title>

            {error && (
              <Box
                role='alert'
                render={p => <p {...p} />}
                sx={t => ({ ...t.text('sm'), color: t.color.destructive })}
              >
                {error}
              </Box>
            )}

            {isNameStep && (
              <form
                onSubmit={event =>
                  onSubmit(event, () => {
                    if (draftName.trim() !== '') {
                      send({ type: 'SUBMIT_NAME' });
                    }
                  })
                }
              >
                <Box
                  render={p => <label {...p} />}
                  sx={t => ({ ...t.text('sm'), fontWeight: t.font.medium, display: 'block' })}
                >
                  Domain name
                  <Input
                    autoFocus
                    value={draftName}
                    disabled={isBusy}
                    placeholder='example.com'
                    onChange={e => send({ type: 'TYPE_NAME', value: e.target.value })}
                    sx={t => ({ marginBlockStart: t.spacing(1) })}
                  />
                </Box>
                <Actions
                  onCancel={() => send({ type: 'CANCEL' })}
                  submitLabel='Continue'
                  submitDisabled={isBusy || draftName.trim() === ''}
                />
              </form>
            )}

            {isEmailStep && (
              <form
                onSubmit={event =>
                  onSubmit(event, () => {
                    if (draftEmail.trim() !== '') {
                      send({ type: 'SUBMIT_EMAIL' });
                    }
                  })
                }
              >
                <Box
                  render={p => <label {...p} />}
                  sx={t => ({ ...t.text('sm'), fontWeight: t.font.medium, display: 'block' })}
                >
                  Verification email
                  <Box
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing(1),
                      marginBlockStart: t.spacing(1),
                    })}
                  >
                    <Input
                      autoFocus
                      value={draftEmail}
                      disabled={isBusy}
                      onChange={e => send({ type: 'TYPE_EMAIL', value: e.target.value })}
                    />
                    <Text
                      render={p => <span {...p} />}
                      intent='mutedForeground'
                    >
                      @{domainName}
                    </Text>
                  </Box>
                </Box>
                <Actions
                  onCancel={() => send({ type: 'CANCEL' })}
                  submitLabel='Send code'
                  submitDisabled={isBusy || draftEmail.trim() === ''}
                />
              </form>
            )}

            {isCodeStep && (
              <form
                onSubmit={event =>
                  onSubmit(event, () => {
                    if (draftCode.trim() !== '') {
                      send({ type: 'SUBMIT_CODE' });
                    }
                  })
                }
              >
                <Dialog.Description render={p => <Text {...p} />}>
                  Enter the verification code sent to {draftEmail}@{domainName}.
                </Dialog.Description>
                <Box
                  render={p => <label {...p} />}
                  sx={t => ({ ...t.text('sm'), fontWeight: t.font.medium, display: 'block' })}
                >
                  Verification code
                  <Input
                    autoFocus
                    value={draftCode}
                    disabled={isBusy}
                    onChange={e => send({ type: 'TYPE_CODE', value: e.target.value })}
                    sx={t => ({ marginBlockStart: t.spacing(1) })}
                  />
                </Box>
                <Box sx={t => ({ marginBlockStart: t.spacing(2), display: 'flex', columnGap: t.spacing(2) })}>
                  <Button
                    variant='ghost'
                    size='sm'
                    type='button'
                    disabled={isBusy}
                    onClick={() => send({ type: 'RESEND' })}
                  >
                    Resend code
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    type='button'
                    disabled={isBusy}
                    onClick={() => send({ type: 'BACK' })}
                  >
                    Back
                  </Button>
                </Box>
                <Actions
                  onCancel={() => send({ type: 'CANCEL' })}
                  submitLabel='Verify'
                  submitDisabled={isBusy || draftCode.trim() === ''}
                />
              </form>
            )}

            {isEnrollmentStep && (
              <form
                onSubmit={event =>
                  onSubmit(event, () => {
                    if (selectedEnrollmentMode !== '') {
                      send({ type: 'SUBMIT_ENROLLMENT' });
                    }
                  })
                }
              >
                <Dialog.Description render={p => <Text {...p} />}>
                  Choose how users from this domain can join the organization.
                </Dialog.Description>
                <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
                  {enrollmentOptions.map(option => (
                    <Box
                      key={option.value}
                      render={p => <label {...p} />}
                      sx={t => ({ display: 'flex', alignItems: 'flex-start', gap: t.spacing(2), cursor: 'pointer' })}
                    >
                      <input
                        type='radio'
                        name='addVerifyEnrollmentMode'
                        value={option.value}
                        checked={selectedEnrollmentMode === option.value}
                        disabled={isBusy}
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
                <Actions
                  onCancel={() => send({ type: 'CANCEL' })}
                  submitLabel='Finish'
                  submitDisabled={isBusy || selectedEnrollmentMode === ''}
                />
              </form>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Actions({
  onCancel,
  submitLabel,
  submitDisabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitDisabled: boolean;
}) {
  return (
    <Box sx={t => ({ marginBlockStart: t.spacing(4), display: 'flex', columnGap: t.spacing(2) })}>
      <Button
        variant='outline'
        type='button'
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type='submit'
        disabled={submitDisabled}
      >
        {submitLabel}
      </Button>
    </Box>
  );
}
