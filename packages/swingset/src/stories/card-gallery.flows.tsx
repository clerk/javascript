import { VerificationCode } from '@clerk/mosaic/blocks/verification';
import { Button } from '@clerk/mosaic/components/button';
import type { CardActions } from '@clerk/mosaic/components/card';
import { Card } from '@clerk/mosaic/components/card';
import { CopyButton } from '@clerk/mosaic/components/copy-button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Field } from '@clerk/mosaic/components/field';
import { Flow } from '@clerk/mosaic/components/flow';
import { Icon } from '@clerk/mosaic/components/icon';
import { Input } from '@clerk/mosaic/components/input';
import { UserProfileAddAuthenticatorView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-add-authenticator.view';
import { UserProfileAddMfaView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-add-mfa.view';
import { UserProfileAddSmsView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-add-sms.view';
import { UserProfileBackupCodesView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-backup-codes.view';
import { X } from '@clerk/mosaic/icons/glyphs/x';
import React, { useEffect, useState } from 'react';

import { StoryMosaicProvider } from '@/components/ChaosProvider';

import {
  Default as ReverificationLive,
  Help as ReverificationHelp,
  MethodPicker as ReverificationMethodPicker,
  OTP as ReverificationOtp,
  Password as ReverificationPassword,
} from './reverification.stories';
import {
  ChoiceMethods as SignInChoiceMethods,
  CodeEmailTryIt as SignInCode,
  CodeResetPassword as SignInResetCode,
  CredentialPassword as SignInPassword,
  Default as SignInLive,
  IdentifierDefault as SignInIdentifier,
  NewPasswordReset as SignInNewPassword,
  NoticeActionBlocked as SignInActionBlocked,
  NoticeForgotPassword as SignInForgotPassword,
  NoticeHelp as SignInHelp,
} from './sign-in.stories';
import { Default as SignUpStart, VerifyEmail as SignUpVerifyEmail } from './sign-up.stories';

export type Surface = 'page' | 'inline' | 'dialog' | 'alert';

export const SURFACE_LABEL: Record<Surface, string> = {
  page: 'Page · prominent',
  inline: 'Inline card',
  dialog: 'Dialog',
  alert: 'Alert dialog',
};

export const RESOLVED: Record<Surface, { variant: string; elevation: string; actions: CardActions; close: string }> = {
  page: { variant: 'prominent', elevation: 'card', actions: 'stacked', close: 'none' },
  inline: { variant: 'default', elevation: 'card', actions: 'fill', close: 'none' },
  dialog: { variant: 'default', elevation: 'overlay', actions: 'fill', close: 'X in Card.Header' },
  alert: { variant: 'default', elevation: 'overlay', actions: 'fill', close: 'none, Cancel is the way out' },
};

export const isDialogSurface = (surface: Surface) => surface === 'dialog' || surface === 'alert';

export const resolvedActions = (surface: Surface, size: 'md' | 'lg' = 'md'): CardActions =>
  isDialogSurface(surface) && size === 'lg' ? 'end' : RESOLVED[surface].actions;

function PreviewCloseButton() {
  return (
    <span className='pointer-events-none absolute end-5 top-4'>
      <Button
        variant='ghost'
        color='neutral'
        shape='circle'
        size='sm'
        aria-hidden
        tabIndex={-1}
      >
        <Icon glyph={X} />
      </Button>
    </span>
  );
}

export function SurfacePreview({ surface, children }: { surface: Surface; children: React.ReactNode }) {
  if (!isDialogSurface(surface)) {
    return <div className='flex justify-center'>{children}</div>;
  }
  return (
    <div className='relative flex justify-center'>
      <div className='[&_.cl-card-root[data-size=lg]:has(.cl-card-content)]:[--_cl-card-footer-border:1px]! relative'>
        {children}
        {surface === 'dialog' ? <PreviewCloseButton /> : null}
      </div>
    </div>
  );
}

interface Nav {
  next: () => void;
  back: () => void;
  close: () => void;
}

const idle: Nav = { next: () => undefined, back: () => undefined, close: () => undefined };

interface CopyChange {
  before: string;
  after: string;
}

interface FlowStep {
  label: string;
  render: (nav: Nav) => React.ReactNode;
}

interface GalleryFlow {
  id: string;
  title: string;
  surface: Surface;
  summary: string;
  size?: 'md' | 'lg';
  steps: FlowStep[];
  live?: React.ComponentType;
  built: string[];
  copy?: CopyChange[];
  decisions: string[];
}

const TRY_CODE = '123456';
const WRONG_CODE = 'That code didn’t work. Try again.';

function useTryCode(onValid: () => void) {
  const [code, setCode] = useState('');
  const [failed, setFailed] = useState<string>();
  const errorMessage = failed !== undefined && (code === failed || code === '') ? WRONG_CODE : undefined;
  const check = (value: string) => {
    if (value === TRY_CODE) {
      setFailed(undefined);
      onValid();
    } else {
      setFailed(value);
    }
  };
  return { code, setCode, errorMessage, check };
}

function EditNameStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Edit name</Card.Title>
        <Card.Description>This is the name people see on your profile.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root>
          <Field.Label>First name</Field.Label>
          <Input defaultValue='Ada' />
        </Field.Root>
        <Field.Root>
          <Field.Label>Last name</Field.Label>
          <Input defaultValue='Lovelace' />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button onClick={nav.close}>Save</Button>
      </Card.Footer>
    </>
  );
}

function AddEmailStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Add email address</Card.Title>
        <Card.Description>You’ll get a code to confirm it’s yours.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <Input
            type='email'
            placeholder='name@example.com'
            defaultValue='ada@acme.com'
          />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button onClick={nav.next}>Send code</Button>
      </Card.Footer>
    </>
  );
}

function VerifyEmailStep({ nav }: { nav: Nav }) {
  const { code, setCode, errorMessage, check } = useTryCode(nav.close);
  return (
    <VerificationCode
      messages={{
        title: 'Verify your email',
        description: 'Enter the 6-digit code sent to ada@acme.com.',
        fieldLabel: 'Verification code',
        secondaryActionLabel: 'Back',
        primaryActionLabel: 'Verify',
        pendingLabel: 'Verifying',
      }}
      value={code}
      onValueChange={setCode}
      onComplete={check}
      errorMessage={errorMessage}
      resend={{ text: 'Didn’t get a code?', label: 'Resend in 24s', disabled: true, onClick: () => undefined }}
      onSubmit={() => check(code)}
      onCancel={nav.back}
    />
  );
}

const MFA_METHODS = ['sms', 'authenticator', 'backup-codes'] as const;

function MfaMethodStep({ nav }: { nav: Nav }) {
  return (
    <UserProfileAddMfaView
      methods={MFA_METHODS}
      onSelect={nav.next}
    />
  );
}

const AUTHENTICATOR_SETUP = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Acme:ada@acme.com?secret=JBSWY3DPEHPK3PXP&issuer=Acme',
};

function AuthenticatorStep({ nav }: { nav: Nav }) {
  const { code, setCode, errorMessage, check } = useTryCode(nav.next);
  return (
    <UserProfileAddAuthenticatorView
      setup={AUTHENTICATOR_SETUP}
      code={code}
      onCodeChange={setCode}
      onSubmit={check}
      errorMessage={errorMessage}
      onBack={nav.back}
    />
  );
}

const PHONES = [
  { id: 'phone_1', phoneNumber: '+15555550123' },
  { id: 'phone_2', phoneNumber: '+447700900123' },
];

function SmsStep({ nav, step }: { nav: Nav; step: 'select' | 'verify' }) {
  const [selectedPhoneId, setSelectedPhoneId] = useState(PHONES[0].id);
  const { code, setCode, errorMessage, check } = useTryCode(nav.next);
  return (
    <UserProfileAddSmsView
      step={step}
      phoneNumbers={PHONES}
      selectedPhoneId={selectedPhoneId}
      onSelectedPhoneIdChange={setSelectedPhoneId}
      onAddPhone={() => undefined}
      onBack={nav.back}
      phoneNumber={PHONES[0].phoneNumber}
      onPhoneNumberChange={() => undefined}
      code={code}
      onCodeChange={setCode}
      onSubmit={value => (step === 'select' ? nav.next() : check(value ?? code))}
      onResend={() => undefined}
      errorMessage={step === 'verify' ? errorMessage : undefined}
      resendSeconds={24}
    />
  );
}

const BACKUP_CODES = [
  'pwkkay19',
  'cvgunlqs',
  '4czio578',
  'a38eewtw',
  'qqnwzvyr',
  'znq8j16s',
  'k4ro51h1',
  '1gjmkwdb',
  'pnr8i06f',
  'ycga0jge',
];

function BackupCodesStep({ nav }: { nav: Nav }) {
  return (
    <UserProfileBackupCodesView
      codes={BACKUP_CODES}
      onCancel={nav.close}
      onRetry={() => undefined}
      onCopy={nav.close}
      onDownload={() => undefined}
    />
  );
}

function CreateApiKeyStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Create API key</Card.Title>
        <Card.Description>Name it so you can find it later. You can revoke it at any time.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root>
          <Field.Label>Name</Field.Label>
          <Input placeholder='CI deploy' />
        </Field.Root>
        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Input placeholder='Used by the deploy pipeline' />
          <Field.Description>Optional. Only your team sees it.</Field.Description>
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button onClick={nav.next}>Create key</Button>
      </Card.Footer>
    </>
  );
}

const API_KEY = 'ak_demo_ac27a8c4-6f20-4e80-ad37-9c46a6d1f2b8';

function CopyApiKeyStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Copy your API key</Card.Title>
        <Card.Description>You won’t be able to see this key again. Store it somewhere safe.</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className='flex items-center gap-2 rounded-lg bg-[var(--cl-color-surface-subtle)] py-1.5 pe-1.5 ps-3 shadow-[inset_0_0_0_1px_var(--cl-color-border-subtle)]'>
          <span className='min-w-0 flex-1 truncate font-mono text-[13px]'>{API_KEY}</span>
          <CopyButton
            value={API_KEY}
            label='Copy API key'
            copiedLabel='Copied'
          />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button onClick={nav.close}>Copy and close</Button>
      </Card.Footer>
    </>
  );
}

function InviteMembersStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Invite members</Card.Title>
        <Card.Description>Separate addresses with commas or spaces. Everyone gets the same role.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root>
          <Field.Label>Email addresses</Field.Label>
          <Input defaultValue='ada@acme.com, grace@acme.com' />
        </Field.Root>
        <Field.Root>
          <Field.Label>Role</Field.Label>
          <Input defaultValue='Member' />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button onClick={nav.close}>Send invites</Button>
      </Card.Footer>
    </>
  );
}

function RemoveEmailStep({ nav }: { nav: Nav }) {
  return (
    <>
      <Card.Header>
        <Card.Title>Remove email address?</Card.Title>
        <Card.Description>
          ada@acme.com will be removed from your account, and you won’t be able to sign in with it.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button
          color='negative'
          onClick={nav.close}
        >
          Remove email address
        </Button>
      </Card.Footer>
    </>
  );
}

function DeleteAccountStep({ nav }: { nav: Nav }) {
  const [phrase, setPhrase] = useState('');
  const [failed, setFailed] = useState(false);
  return (
    <>
      <Card.Header>
        <Card.Title>Delete account?</Card.Title>
        <Card.Description>All of your data will be permanently deleted. This can’t be undone.</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {failed ? 'Cancel your subscription first, then delete your account.' : null}
      </Card.Banner>
      <Card.Content>
        <Field.Root>
          <Field.Label>Type “Delete account” to confirm</Field.Label>
          <Input
            value={phrase}
            onChange={event => setPhrase(event.target.value)}
          />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          onClick={nav.close}
        >
          Cancel
        </Button>
        <Button
          color='negative'
          disabled={phrase !== 'Delete account'}
          focusableWhenDisabled
          onClick={() => setFailed(true)}
        >
          Delete account
        </Button>
      </Card.Footer>
    </>
  );
}

const story = (Component: React.ComponentType) => () => <Component />;

export const FLOWS: GalleryFlow[] = [
  {
    id: 'sign-in-code',
    title: 'Sign in with an email code',
    surface: 'page',
    summary: 'Start, then the code. Try 123456.',
    steps: [
      { label: 'Start', render: story(SignInIdentifier) },
      { label: 'Check your email', render: story(SignInCode) },
    ],
    live: SignInLive,
    built: ['SignInView', 'Card variant=prominent', 'AuthMark', 'VerificationCode (stacked)', 'Prompt'],
    copy: [
      {
        before: 'Welcome! Sign in or create an account to continue',
        after: 'Sign in or create an account to continue.',
      },
      { before: 'Resend (30)', after: 'Resend in 30s' },
    ],
    decisions: [
      'Large inputs and buttons with 14px text, stacked under the field.',
      'A wrong code stays in the boxes with the error; the next key starts over.',
    ],
  },
  {
    id: 'sign-in-password-reset',
    title: 'Sign in with a password, then reset it',
    surface: 'page',
    summary: 'Password, forgot it, code, new password.',
    steps: [
      { label: 'Password', render: story(SignInPassword) },
      { label: 'Forgot password', render: story(SignInForgotPassword) },
      { label: 'Reset code', render: story(SignInResetCode) },
      { label: 'New password', render: story(SignInNewPassword) },
    ],
    live: SignInLive,
    built: ['SignInView', 'AuthIdentityPreview', 'VerificationActions (stacked)', 'VerificationCode'],
    copy: [{ before: 'Back', after: 'Back to sign in' }],
    decisions: ['The secondary action is a quiet ghost under the primary, and says where it goes.'],
  },
  {
    id: 'sign-in-another-method',
    title: 'Sign in another way, then get help',
    surface: 'page',
    summary: 'From a factor to the method list, then to help.',
    steps: [
      { label: 'Password', render: story(SignInPassword) },
      { label: 'Another method', render: story(SignInChoiceMethods) },
      { label: 'Get help', render: story(SignInHelp) },
    ],
    live: SignInLive,
    built: ['VerificationMethodPicker', 'VerificationHelp (stacked)', 'Prompt'],
    copy: [
      { before: 'Email code to …', after: 'Email a code to …' },
      { before: 'Back', after: 'Back to sign-in methods' },
    ],
    decisions: ['Chevrons are pulled in 4px so they line up optically with the icon tiles.'],
  },
  {
    id: 'sign-in-blocked',
    title: 'Sign-in blocked',
    surface: 'page',
    summary: 'The app explains and offers one way forward.',
    steps: [{ label: 'Blocked', render: story(SignInActionBlocked) }],
    built: ['AuthActionBlocked'],
    copy: [{ before: 'We couldn’t complete this request', after: 'Sign-in blocked' }],
    decisions: ['The reference is a label, value and copy button, not a read-only input.'],
  },
  {
    id: 'sign-up',
    title: 'Sign up and verify',
    surface: 'page',
    summary: 'Details, then the email code.',
    steps: [
      { label: 'Create account', render: story(SignUpStart) },
      { label: 'Verify email', render: story(SignUpVerifyEmail) },
    ],
    live: SignUpStart,
    built: ['SignUpView', 'AuthMark', 'VerificationCode (stacked)', 'Prompt'],
    decisions: ['Same shape as sign-in: large controls, the button under the fields, the sign-in link in the footer.'],
  },
  {
    id: 'reverification',
    title: 'Re-verify before a sensitive change',
    surface: 'inline',
    summary: 'Password, the method list, a code, help.',
    steps: [
      { label: 'Password', render: story(ReverificationPassword) },
      { label: 'Another method', render: story(ReverificationMethodPicker) },
      { label: 'Code', render: story(ReverificationOtp) },
      { label: 'Get help', render: story(ReverificationHelp) },
    ],
    live: ReverificationLive,
    built: ['Reverification', 'VerificationPassword', 'VerificationMethodPicker', 'VerificationCode (inline)'],
    copy: [
      { before: 'Back', after: 'Back to verification' },
      { before: 'Back (from help)', after: 'Back to verification methods' },
    ],
    decisions: ['An inline card fills its footer.'],
  },
  {
    id: 'add-email',
    title: 'Add an email address',
    surface: 'dialog',
    summary: 'Enter it, then the code. Try 123456.',
    steps: [
      { label: 'Email', render: nav => <AddEmailStep nav={nav} /> },
      { label: 'Code', render: nav => <VerifyEmailStep nav={nav} /> },
    ],
    built: ['Dialog', 'Card', 'Flow', 'VerificationCode (inline)'],
    copy: [
      { before: 'Add email', after: 'Add email address' },
      { before: 'Continue', after: 'Send code' },
    ],
    decisions: [
      'Cancel from the first step; Back takes its slot on the second.',
      'Actions fill the row and stack on a phone.',
    ],
  },
  {
    id: 'add-authenticator',
    title: 'Add two-step verification with an authenticator app',
    surface: 'dialog',
    summary: 'Pick the method, scan or enter the key, then save backup codes.',
    steps: [
      { label: 'Method', render: nav => <MfaMethodStep nav={nav} /> },
      { label: 'Scan and verify', render: nav => <AuthenticatorStep nav={nav} /> },
      { label: 'Backup codes', render: nav => <BackupCodesStep nav={nav} /> },
    ],
    built: ['UserProfileAddMfaView', 'UserProfileAddAuthenticatorView', 'Reveal', 'Otp', 'UserProfileBackupCodesView'],
    decisions: [
      'The QR sits centered in a recessed panel; the setup key swaps in with a height morph.',
      'The method list sits 16px under the header, and chevrons line up optically.',
    ],
  },
  {
    id: 'add-sms',
    title: 'Add two-step verification by text message',
    surface: 'dialog',
    summary: 'Pick the method, choose a number, enter the code, save backup codes.',
    steps: [
      { label: 'Method', render: nav => <MfaMethodStep nav={nav} /> },
      {
        label: 'Phone number',
        render: nav => (
          <SmsStep
            nav={nav}
            step='select'
          />
        ),
      },
      {
        label: 'Code',
        render: nav => (
          <SmsStep
            nav={nav}
            step='verify'
          />
        ),
      },
      { label: 'Backup codes', render: nav => <BackupCodesStep nav={nav} /> },
    ],
    built: ['UserProfileAddMfaView', 'UserProfileAddSmsView', 'UserProfileBackupCodesView'],
    decisions: ['Being audited in detail; see the two-step board in Paper.'],
  },
  {
    id: 'create-api-key',
    title: 'Create an API key',
    surface: 'dialog',
    summary: 'Name it, then copy the secret once.',
    steps: [
      { label: 'Details', render: nav => <CreateApiKeyStep nav={nav} /> },
      { label: 'Copy the key', render: nav => <CopyApiKeyStep nav={nav} /> },
    ],
    built: ['Dialog', 'Card', 'Flow', 'CopyButton'],
    copy: [
      { before: 'Add new API key', after: 'Create API key' },
      { before: 'Add API Key', after: 'Create key' },
      {
        before: 'For security reasons, we won’t allow you to view it again later.',
        after: 'You won’t be able to see this key again. Store it somewhere safe.',
      },
    ],
    decisions: ['One name for one action, in sentence case.'],
  },
  {
    id: 'edit-name',
    title: 'Edit name',
    surface: 'dialog',
    summary: 'A one-step form.',
    steps: [{ label: 'Edit', render: nav => <EditNameStep nav={nav} /> }],
    built: ['Dialog', 'Card'],
    copy: [{ before: 'Save changes', after: 'Save' }],
    decisions: ['No divider in a medium dialog; the actions read as part of the form.'],
  },
  {
    id: 'invite-members',
    title: 'Invite members',
    surface: 'dialog',
    size: 'lg',
    summary: 'The large size: a footer divider, with the actions at the end.',
    steps: [{ label: 'Invite', render: nav => <InviteMembersStep nav={nav} /> }],
    built: ['Dialog', 'Card size=lg'],
    decisions: [
      'The only size with a footer divider: large forms can scroll.',
      'Actions hug their labels at the end, so the divider reads as a toolbar; on a phone they stack.',
      'No “Secured by Clerk” inside the profile.',
    ],
  },
  {
    id: 'remove-email',
    title: 'Remove an email address',
    surface: 'alert',
    summary: 'A question with two equal answers.',
    steps: [{ label: 'Confirm', render: nav => <RemoveEmailStep nav={nav} /> }],
    built: ['Confirmation', 'Card'],
    copy: [{ before: 'Remove', after: 'Remove email address' }],
    decisions: ['The button names the consequence.'],
  },
  {
    id: 'delete-account',
    title: 'Delete the account',
    surface: 'alert',
    summary: 'Type the phrase; a failed request shows in the banner.',
    steps: [{ label: 'Confirm', render: nav => <DeleteAccountStep nav={nav} /> }],
    built: ['Destructive', 'Card.Banner'],
    copy: [
      {
        before: 'Are you sure you want to delete your account? …',
        after: 'All of your data will be permanently deleted. This can’t be undone.',
      },
    ],
    decisions: ['The request error goes in the banner, so the typed phrase stays valid.'],
  },
];

function StepPreview({ flow, step }: { flow: GalleryFlow; step: FlowStep }) {
  if (!isDialogSurface(flow.surface)) {
    return <>{step.render(idle)}</>;
  }
  return (
    <SurfacePreview surface={flow.surface}>
      <Card.Root
        size={flow.size}
        actions={resolvedActions(flow.surface, flow.size)}
        renderBranding={false}
      >
        {step.render(idle)}
      </Card.Root>
    </SurfacePreview>
  );
}

function DialogPlayer({ flow }: { flow: GalleryFlow }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const nav: Nav = {
    next: () => {
      if (index < flow.steps.length - 1) {
        setDirection(1);
        setIndex(index + 1);
      } else {
        setOpen(false);
      }
    },
    back: () => {
      if (index > 0) {
        setDirection(-1);
        setIndex(index - 1);
      } else {
        setOpen(false);
      }
    },
    close: () => setOpen(false),
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (next) {
          setIndex(0);
          setDirection(1);
        }
      }}
      role={flow.surface === 'alert' ? 'alertdialog' : 'dialog'}
    >
      <Dialog.Trigger
        render={
          <Button
            size='sm'
            variant='outline'
            color='neutral'
          />
        }
      >
        Play flow
      </Dialog.Trigger>
      <Dialog.Popup>
        <Card.Root
          size={flow.size}
          renderBranding={false}
        >
          <Flow.Root
            value={String(index)}
            direction={direction}
            state={index}
          >
            {current =>
              flow.steps.map((step, stepIndex) => (
                <Flow.Step
                  key={step.label}
                  ids={[String(stepIndex)]}
                >
                  {current === stepIndex ? step.render(nav) : null}
                </Flow.Step>
              ))
            }
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function LivePlayer({ flow, Live }: { flow: GalleryFlow; Live: React.ComponentType }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
  return (
    <>
      <Button
        size='sm'
        variant='outline'
        color='neutral'
        onClick={() => setOpen(true)}
      >
        Play flow
      </Button>
      {open ? (
        <div
          role='dialog'
          aria-label={flow.title}
          className='bg-background/90 fixed inset-0 z-50 grid place-items-center overflow-auto p-6 backdrop-blur-sm'
        >
          <button
            type='button'
            onClick={() => setOpen(false)}
            className='hover:bg-muted fixed end-6 top-6 rounded-md border px-3 py-1 text-[13px] font-medium'
          >
            Close
          </button>
          <Live />
        </div>
      ) : null}
    </>
  );
}

function FlowDetails({ flow }: { flow: GalleryFlow }) {
  const resolved = RESOLVED[flow.surface];
  const rows: Array<[string, string]> = [
    ['Surface', SURFACE_LABEL[flow.surface]],
    ['variant', resolved.variant],
    ['size', flow.size ?? 'md'],
    ['elevation', resolved.elevation],
    ['actions', `${resolvedActions(flow.surface, flow.size)} (from the surface and size; not passed)`],
    ['divider', isDialogSurface(flow.surface) && flow.size === 'lg' ? 'yes (lg)' : 'no'],
    ['close', resolved.close],
  ];
  return (
    <div className='bg-muted/40 grid gap-4 border-t px-4 py-4 text-[13px] leading-5'>
      <div className='grid grid-cols-[96px_1fr] gap-x-3 gap-y-1'>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <span className='text-muted-foreground font-mono'>{label}</span>
            <span className='font-mono'>{value}</span>
          </React.Fragment>
        ))}
      </div>
      <div>
        <div className='text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wider'>Built from</div>
        <div className='flex flex-wrap gap-1.5'>
          {flow.built.map(part => (
            <span
              key={part}
              className='bg-background rounded border px-1.5 py-0.5 font-mono text-[12px]'
            >
              {part}
            </span>
          ))}
        </div>
      </div>
      {flow.copy ? (
        <div>
          <div className='text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wider'>Copy</div>
          <ul className='grid gap-1'>
            {flow.copy.map(change => (
              <li key={change.after}>
                <span className='text-muted-foreground line-through'>{change.before}</span>
                <span className='text-muted-foreground'> → </span>
                <span>{change.after}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <div className='text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wider'>Decisions</div>
        <ul className='list-disc ps-4'>
          {flow.decisions.map(decision => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FlowRow({ flow }: { flow: GalleryFlow }) {
  const [open, setOpen] = useState(false);
  const stage = isDialogSurface(flow.surface) ? 'bg-neutral-500/30 dark:bg-black/50' : 'bg-muted/50';
  return (
    <article
      id={flow.id}
      className='bg-background overflow-hidden rounded-xl border'
    >
      <header className='flex flex-wrap items-center justify-between gap-3 px-4 py-3'>
        <div className='grid gap-0.5'>
          <h3 className='text-sm font-semibold'>{flow.title}</h3>
          <p className='text-muted-foreground text-[13px]'>{flow.summary}</p>
        </div>
        <div className='flex shrink-0 gap-1.5'>
          <span className='text-muted-foreground rounded border px-1.5 py-0.5 text-[11px]'>
            {SURFACE_LABEL[flow.surface]}
          </span>
          <span className='rounded border px-1.5 py-0.5 font-mono text-[11px]'>
            {resolvedActions(flow.surface, flow.size)}
          </span>
          <span className='text-muted-foreground rounded border px-1.5 py-0.5 text-[11px]'>
            {flow.steps.length} {flow.steps.length === 1 ? 'step' : 'steps'}
          </span>
        </div>
      </header>
      <div className={`flex items-start gap-6 overflow-x-auto px-6 py-6 ${stage}`}>
        {flow.steps.map((step, index) => (
          <div
            key={step.label}
            className='grid shrink-0 justify-items-center gap-3'
          >
            <div className='text-muted-foreground flex items-center gap-2 text-[12px] font-medium'>
              <span className='bg-background grid size-5 place-items-center rounded-full border text-[11px]'>
                {index + 1}
              </span>
              {step.label}
            </div>
            <StoryMosaicProvider>
              <StepPreview
                flow={flow}
                step={step}
              />
            </StoryMosaicProvider>
          </div>
        ))}
      </div>
      <footer className='flex items-center gap-2 border-t px-4 py-2.5'>
        <button
          type='button'
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
          className='hover:bg-muted rounded px-2 py-1 text-[13px] font-medium'
        >
          {open ? 'Hide details' : 'View details'}
        </button>
        <StoryMosaicProvider>
          {isDialogSurface(flow.surface) ? (
            <DialogPlayer flow={flow} />
          ) : flow.live ? (
            <LivePlayer
              flow={flow}
              Live={flow.live}
            />
          ) : null}
        </StoryMosaicProvider>
      </footer>
      {open ? <FlowDetails flow={flow} /> : null}
    </article>
  );
}

const SECTIONS: Array<{ surfaces: Surface[]; title: string; description: string }> = [
  {
    surfaces: ['page'],
    title: 'Sign-in and sign-up flows',
    description:
      'The card is the page, so actions stack under large controls. Play opens the live flow; sign in with any email and use 123456 for codes.',
  },
  {
    surfaces: ['inline'],
    title: 'Inline flows',
    description: 'Cards that sit inside a page. The footer fills its row.',
  },
  {
    surfaces: ['dialog', 'alert'],
    title: 'Dialog flows',
    description:
      'Every step of a dialog flow in one row. Play runs the whole flow in one real dialog, moving between steps with the Flow slide.',
  },
];

export function FlowGallery() {
  return (
    <>
      {SECTIONS.map(section => (
        <section
          key={section.title}
          className='grid gap-4'
        >
          <div className='grid gap-1'>
            <h2 className='text-lg font-semibold'>{section.title}</h2>
            <p className='text-muted-foreground text-sm'>{section.description}</p>
          </div>
          <div className='grid gap-6'>
            {FLOWS.filter(flow => section.surfaces.includes(flow.surface)).map(flow => (
              <FlowRow
                key={flow.id}
                flow={flow}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
