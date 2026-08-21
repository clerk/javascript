import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { AddContactDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/add-contact-dialog.view';
import {
  EditAvatarDialogView,
  EditNameDialogView,
  EditUsernameDialogView,
} from '@clerk/ui/mosaic/user-profile/dialogs/edit-profile-dialog.view';
import type {
  AddContactFlowState,
  EditAvatarState,
  EditNameState,
  EditUsernameState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';
import { useId, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import type { AccountSectionFlowConfig } from './user-profile-account-section-flow.harness';
import {
  DEFAULT_ACCOUNT_SECTION_FLOW_CONFIG,
  useAccountSectionFlow,
} from './user-profile-account-section-flow.harness';

export { default as __source } from './user-profile-account-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileAccountSectionFlow',
  // Not a component name: there is no `<UserProfileAccountSectionFlow />`, so the sidebar and the
  // breadcrumb show this instead. `title` still drives the slug.
  label: 'User profile account flow',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/dialogs/add-contact-dialog.view.tsx',
};

const INITIAL_EMAILS = [
  { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
  { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
];

const INITIAL_PHONES = [{ id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true }];

const INITIAL_IDENTITY = {
  firstName: 'Preston',
  lastName: 'Booth',
  username: 'prestonxyz',
  imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
};

// `StoryEmbed` centres a story inside `flex items-center justify-center`, so a fragment's children
// become flex items in a row. Stories here own a column wrapper rather than leaving the controls
// sitting beside the component.
const storyColumn = { display: 'flex', flexDirection: 'column', width: '100%' } as const;

// One control per line: these are independent conditions rather than a related set, and a wrapped
// row made it ambiguous which options belonged to which label.
const controlsBar = {
  alignItems: 'flex-start',
  border: '1px solid var(--cl-color-border)',
  borderRadius: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  fontSize: '0.8125rem',
  gap: '0.5rem',
  marginBottom: '1.5rem',
  padding: '0.75rem 1rem',
} as const;

const controlLabel = { alignItems: 'center', display: 'flex', gap: '0.375rem' } as const;

const controlGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' } as const;

const controlHint = { color: 'var(--cl-color-neutral-faded)', fontSize: '0.75rem' } as const;

const controlGroupTitle = {
  color: 'var(--cl-color-neutral-faded)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
} as const;

const controlDivider = {
  border: 0,
  borderTop: '1px solid var(--cl-color-border)',
  margin: '0.25rem 0',
  width: '100%',
} as const;

/**
 * A run of controls under a heading.
 *
 * The two kinds answer different questions and were previously indistinguishable: instance settings
 * decide which flows exist at all, while the network mocks decide what happens partway through one.
 */
function ControlGroup({
  title,
  divided = false,
  children,
}: {
  title: string;
  /** Rules off from the group above. */
  divided?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {divided ? <hr style={controlDivider} /> : null}
      <span style={controlGroupTitle}>{title}</span>
      <div style={controlGroup}>{children}</div>
    </>
  );
}

/** The name of a control, so the eye can find it before reading its options. */
const controlName = { fontWeight: 600 } as const;

const radioGroup = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.375rem 0.75rem',
} as const;

const radioOption = { alignItems: 'center', display: 'flex', gap: '0.25rem' } as const;

/**
 * A set of mutually exclusive options, laid out so every branch is visible without opening
 * anything — a story control exists to show what the flow can do, which a collapsed `<select>`
 * hides.
 *
 * A roled `div` rather than `fieldset` / `legend`: a `legend` inside a flex container is laid out
 * inconsistently across browsers, and `role='radiogroup'` plus `aria-label` announces the same
 * grouping without depending on that.
 */
function RadioGroup<Value extends string>({
  legend,
  value,
  options,
  disabled = false,
  onChange,
}: {
  legend: string;
  value: Value;
  options: readonly Value[];
  disabled?: boolean;
  onChange: (value: Value) => void;
}) {
  // One stable `name` per mounted group, so two groups sharing an option value stay independent.
  const name = useId();

  return (
    <div
      aria-label={legend}
      role='radiogroup'
      style={{ ...radioGroup, opacity: disabled ? 0.5 : 1 }}
    >
      <span style={controlName}>{legend}</span>
      {options.map(option => (
        <label
          key={option}
          style={radioOption}
        >
          <input
            checked={value === option}
            disabled={disabled}
            name={name}
            type='radio'
            value={option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

const snapshotPicker = { display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' } as const;

const snapshotRow = { alignItems: 'center', display: 'flex', gap: '0.5rem' } as const;

const snapshotStep = {
  color: 'var(--cl-color-neutral-faded)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.75rem',
  minWidth: '5.5rem',
  textAlign: 'end',
} as const;

const snapshotOptions = { display: 'flex', flexWrap: 'wrap', gap: '0.25rem' } as const;

const snapshotChip = {
  alignItems: 'center',
  border: '1px solid var(--cl-color-border)',
  borderRadius: '0.375rem',
  color: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  font: 'inherit',
  gap: '0.25rem',
  backgroundColor: 'transparent',
  padding: '0.125rem 0.5rem',
} as const;

// Marks the snapshot the dialog is showing RIGHT NOW. Once it closes nothing is highlighted:
// a chip left lit after the dialog is gone reads as a persistent selection rather than as the
// state currently on screen.
const snapshotChipSelected = {
  ...snapshotChip,
  borderColor: 'var(--cl-color-primary)',
  backgroundColor: 'var(--cl-color-primary-faded)',
  fontWeight: 600,
} as const;

export interface Snapshot<State> {
  /** The flow step, which groups the options. */
  step: string;
  /** What distinguishes this snapshot from the others on the same step. */
  variant: string;
  state: State;
}

/**
 * The snapshot list, grouped by step. Each entry is a button that selects the snapshot AND opens
 * the dialog on it, so there is no separate trigger to press afterwards.
 *
 * Flat `step · variant` chips in one wrapped row were unreadable: half the variants repeat across
 * steps (three separate `idle`s), so the eye had to re-read the prefix on every chip to place it.
 * One row per step with the step named once turns that into a shape you can scan — and it happens
 * to be the shape of the machine, which is the thing the story is documenting.
 */
function SnapshotPicker<State>({
  snapshots,
  selected,
  onSelect,
}: {
  snapshots: readonly Snapshot<State>[];
  /** Index currently on screen, or `null` when the dialog is closed and nothing is showing. */
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const steps: string[] = [];
  for (const snapshot of snapshots) {
    if (!steps.includes(snapshot.step)) {
      steps.push(snapshot.step);
    }
  }

  return (
    <div
      aria-label='Snapshot'
      role='group'
      style={snapshotPicker}
    >
      <span style={controlName}>Snapshot</span>
      {steps.map(step => (
        <div
          key={step}
          style={snapshotRow}
        >
          <span style={snapshotStep}>{step}</span>
          <div style={snapshotOptions}>
            {snapshots.map((snapshot, index) =>
              snapshot.step === step ? (
                <button
                  key={snapshot.variant}
                  // Named for the pair, or a screen reader hears `idle` three times with nothing
                  // to tell the three apart.
                  aria-label={`${step} ${snapshot.variant}`}
                  aria-pressed={index === selected}
                  style={index === selected ? snapshotChipSelected : snapshotChip}
                  type='button'
                  onClick={() => onSelect(index)}
                >
                  {snapshot.variant}
                </button>
              ) : null,
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const EMAIL_STRATEGIES = ['email_code', 'email_link'] as const;
const LINK_OUTCOMES = ['verified', 'verified_other_tab', 'expired', 'failed'] as const;
const REVERIFICATION_STRATEGIES = ['password', 'email_code'] as const;

/**
 * Stands in for swingset's variant knobs, which only describe StyleX variants. These are backend
 * conditions rather than visual ones, so the story owns them.
 */
function Controls({
  config,
  onChange,
}: {
  config: AccountSectionFlowConfig;
  onChange: (next: Partial<AccountSectionFlowConfig>) => void;
}) {
  return (
    <div style={controlsBar}>
      {/* What the instance is configured to allow. These change which flows exist at all, so they
          are what you reach for to answer "what does this look like for that customer". */}
      <ControlGroup title='Instance settings'>
        <label style={controlLabel}>
          <input
            checked={config.disableAdditionalIdentifications}
            type='checkbox'
            onChange={event => onChange({ disableAdditionalIdentifications: event.target.checked })}
          />
          <span style={controlName}>Disable additional identifications (enterprise connection)</span>
        </label>
        <label style={controlLabel}>
          <input
            checked={config.identifiersImmutable}
            type='checkbox'
            onChange={event => onChange({ identifiersImmutable: event.target.checked })}
          />
          <span style={controlName}>Email / phone immutable (attribute setting)</span>
        </label>
        <RadioGroup
          legend='Email strategy'
          options={EMAIL_STRATEGIES}
          value={config.emailStrategy}
          onChange={emailStrategy => onChange({ emailStrategy })}
        />
        <label style={controlLabel}>
          <input
            checked={config.requireReverification}
            type='checkbox'
            onChange={event => onChange({ requireReverification: event.target.checked })}
          />
          <span style={controlName}>Require reverification</span>
        </label>
        <RadioGroup
          disabled={!config.requireReverification}
          legend='Challenge'
          options={REVERIFICATION_STRATEGIES}
          value={config.reverificationStrategy}
          onChange={reverificationStrategy => onChange({ reverificationStrategy })}
        />
        <label style={controlLabel}>
          <input
            checked={config.enterpriseManaged}
            type='checkbox'
            onChange={event => onChange({ enterpriseManaged: event.target.checked })}
          />
          <span style={controlName}>Enterprise-managed (name read-only)</span>
        </label>
      </ControlGroup>

      {/* What the simulated server does. None of these change which flows exist — they change what
          happens partway through one. */}
      <ControlGroup
        divided
        title='Network'
      >
        <label style={controlLabel}>
          <span style={controlName}>Latency</span>
          <input
            max={4000}
            min={0}
            step={100}
            type='range'
            value={config.latencyMs}
            onChange={event => onChange({ latencyMs: Number(event.target.value) })}
          />
          {config.latencyMs}ms
        </label>
        <RadioGroup
          legend='Link outcome'
          options={LINK_OUTCOMES}
          value={config.emailLinkOutcome}
          onChange={emailLinkOutcome => onChange({ emailLinkOutcome })}
        />
        <label style={controlLabel}>
          <input
            checked={config.ssoFails}
            type='checkbox'
            onChange={event => onChange({ ssoFails: event.target.checked })}
          />
          <span style={controlName}>SSO fails</span>
          {/* The only path that reaches this, and nothing else on screen says so. */}
          <span style={controlHint}>
            add an email at <code>@{config.ssoDomains[0]}</code> to route through enterprise SSO
          </span>
        </label>
        <label style={controlLabel}>
          <input
            checked={config.failWithFormError}
            type='checkbox'
            onChange={event => onChange({ failWithFormError: event.target.checked })}
          />
          <span style={controlName}>Force server error</span>
        </label>
        <span style={controlHint}>
          code <code>{config.validCode}</code> · password <code>{config.validPassword}</code> · taken{' '}
          <code>{config.takenIdentifiers[0]}</code> · taken username <code>{config.takenUsernames[0]}</code>
        </span>
      </ControlGroup>
    </div>
  );
}

/**
 * The account panel with every contact action wired to a flow that takes time, fails, and asks for
 * things — the shape a state machine will drive once one exists.
 */
export function Default() {
  const [config, setConfig] = useState<AccountSectionFlowConfig>(DEFAULT_ACCOUNT_SECTION_FLOW_CONFIG);
  const flow = useAccountSectionFlow({
    config,
    initialEmails: INITIAL_EMAILS,
    initialIdentity: INITIAL_IDENTITY,
    initialPhones: INITIAL_PHONES,
  });

  // `shouldAllowIdentificationCreation && !isImmutable` and `!isImmutable`, as `AccountSections`
  // computes them. An immutable identifier can be neither added nor removed.
  const canAddIdentifier = !config.disableAdditionalIdentifications && !config.identifiersImmutable;
  const canRemoveIdentifier = !config.identifiersImmutable;

  const confirmRecord = flow.confirm
    ? (flow.confirm.pending.kind === 'email' ? flow.emails : flow.phones).find(
        item => item.id === flow.confirm?.pending.id,
      )
    : undefined;

  return (
    <div style={storyColumn}>
      <Controls
        config={config}
        onChange={next => setConfig(current => ({ ...current, ...next }))}
      />
      {/* The section renders the dialogs itself; the harness supplies only their state and events,
          which is what the controller will hand it once a machine drives this. */}
      <UserProfileAccountSectionView
        // Legacy always LISTS every identifier and hides only the actions — the single-row layout
        // has no counterpart there, so the flow story renders the list and expresses both
        // constraints by withholding callbacks, exactly as `AccountSections` withholds them.
        allowMultipleAccounts
        addContact={
          flow.add
            ? {
                kind: flow.add.kind,
                state: flow.add.state,
                onCancel: flow.closeAdd,
                onCodeChange: flow.setCode,
                onOpenSsoPopup: () => void flow.openSsoPopup(),
                onResend: () => void flow.resend(),
                onSubmitCode: () => void flow.submitCode(),
                onSubmitIdentifier: () => void flow.submitIdentifier(),
                onValueChange: flow.setIdentifier,
              }
            : null
        }
        confirmContact={
          flow.confirm
            ? {
                action: flow.confirm.pending.action,
                kind: flow.confirm.pending.kind,
                isVerified: confirmRecord?.isVerified ?? false,
                state: flow.confirm.state,
                onCancel: flow.closeConfirm,
                onConfirm: () => void flow.submitConfirm(),
              }
            : null
        }
        editProfile={
          flow.edit
            ? {
                ...flow.edit,
                onNameChange: flow.setName,
                onUsernameChange: flow.setUsername,
                onSelectAvatarFile: flow.selectAvatarFile,
                onRemoveAvatar: () => void flow.removeAvatar(),
                onSubmit: () => void flow.submitEdit(),
                onCancel: flow.closeEdit,
              }
            : null
        }
        flowTriggerRef={flow.triggerRef}
        reverification={
          flow.reverification
            ? {
                state: flow.reverification,
                onCancel: flow.cancelReverification,
                onResend: () => void flow.resendReverification(),
                onSubmit: () => void flow.submitReverification(),
                onValueChange: flow.setReverificationValue,
              }
            : null
        }
        emails={flow.emails}
        imageUrl={flow.identity.imageUrl}
        name={`${flow.identity.firstName} ${flow.identity.lastName}`.trim()}
        phones={flow.phones}
        username={flow.identity.username}
        onAddEmail={canAddIdentifier ? () => flow.openAdd('email') : undefined}
        onAddPhone={canAddIdentifier ? () => flow.openAdd('phone') : undefined}
        onEditProfilePicture={() => flow.openEdit('avatar')}
        onNameChange={() => flow.openEdit('name')}
        onUsernameChange={() => flow.openEdit('username')}
        onRemoveEmail={
          canRemoveIdentifier
            ? id => {
                const record = flow.emails.find(email => email.id === id);
                if (record) {
                  flow.openConfirm({ action: 'remove', kind: 'email', id }, record.value);
                }
              }
            : undefined
        }
        onRemovePhone={
          canRemoveIdentifier
            ? id => {
                const record = flow.phones.find(phone => phone.id === id);
                if (record) {
                  flow.openConfirm({ action: 'remove', kind: 'phone', id }, record.value);
                }
              }
            : undefined
        }
        onSetPrimaryEmail={id => {
          const record = flow.emails.find(email => email.id === id);
          if (record) {
            flow.openConfirm({ action: 'set-primary', kind: 'email', id }, record.value);
          }
        }}
        onSetPrimaryPhone={id => {
          const record = flow.phones.find(phone => phone.id === id);
          if (record) {
            flow.openConfirm({ action: 'set-primary', kind: 'phone', id }, record.value);
          }
        }}
        onVerifyEmail={() => flow.openAdd('email')}
        onVerifyPhone={() => flow.openAdd('phone')}
      />
    </div>
  );
}

/**
 * Every rendered state of the add-email flow, side by side, with no backend behind them. This is
 * what the view contract looks like from the machine's side: one snapshot in, one surface out.
 */
export function States() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  // Advancing the flow is inert on purpose — the rendered step is whichever snapshot is selected,
  // so a working Verify would contradict the radio. Cancel is the exception: it dismisses rather
  // than advances, and leaving it dead made it look broken next to the close button and Escape,
  // which do work because they run through the dialog primitive rather than through these props.
  const noop = () => undefined;
  const actions = {
    onCancel: () => setOpen(false),
    onCodeChange: noop,
    onOpenSsoPopup: noop,
    onResend: noop,
    onSubmitCode: noop,
    onSubmitIdentifier: noop,
    onValueChange: noop,
  };
  const resend = { isResending: false, secondsRemaining: 0 };

  const snapshots: readonly Snapshot<AddContactFlowState>[] = [
    { step: 'identifier', variant: 'idle', state: { step: 'identifier', value: '', isSubmitting: false, errors: {} } },
    {
      step: 'identifier',
      variant: 'field error',
      state: {
        step: 'identifier',
        value: 'taken@clerk.dev',
        isSubmitting: false,
        errors: { field: 'That email address is taken. Please try another.' },
      },
    },
    {
      step: 'identifier',
      variant: 'unattributed error',
      state: {
        step: 'identifier',
        value: 'new@clerk.dev',
        isSubmitting: false,
        errors: { form: 'Something went wrong. Please try again.' },
      },
    },
    {
      step: 'identifier',
      variant: 'submitting',
      state: { step: 'identifier', value: 'new@clerk.dev', isSubmitting: true, errors: {} },
    },
    {
      step: 'preparing',
      variant: 'sending',
      state: { step: 'preparing', identifier: 'new@clerk.dev', strategy: 'email_code' },
    },
    {
      step: 'code',
      variant: 'idle',
      state: {
        step: 'code',
        identifier: 'new@clerk.dev',
        strategy: 'email_code',
        code: '',
        status: 'idle',
        errors: {},
        resend,
      },
    },
    {
      step: 'code',
      variant: 'verifying',
      state: {
        step: 'code',
        identifier: 'new@clerk.dev',
        strategy: 'email_code',
        code: '424242',
        status: 'verifying',
        errors: {},
        resend,
      },
    },
    {
      step: 'code',
      variant: 'wrong code',
      state: {
        step: 'code',
        identifier: 'new@clerk.dev',
        strategy: 'email_code',
        code: '',
        status: 'error',
        errors: { field: 'Incorrect code. Please try again.' },
        resend,
      },
    },
    {
      step: 'code',
      variant: 'verified',
      state: {
        step: 'code',
        identifier: 'new@clerk.dev',
        strategy: 'email_code',
        code: '424242',
        status: 'success',
        errors: {},
        resend,
      },
    },
    {
      step: 'link',
      variant: 'waiting',
      state: {
        step: 'link',
        identifier: 'new@clerk.dev',
        resend: { isResending: false, secondsRemaining: 42 },
        errors: {},
      },
    },
    {
      step: 'link',
      variant: 'expired',
      state: { step: 'link', identifier: 'new@clerk.dev', resend, outcome: 'expired', errors: {} },
    },
    {
      step: 'link',
      variant: 'invalid',
      state: { step: 'link', identifier: 'new@clerk.dev', resend, outcome: 'failed', errors: {} },
    },
    {
      step: 'link',
      variant: 'verified in another tab',
      state: { step: 'link', identifier: 'new@clerk.dev', resend, outcome: 'verified_other_tab', errors: {} },
    },
    {
      step: 'sso',
      variant: 'idle',
      state: { step: 'sso', identifier: 'dev@acmecorp.com', providerName: 'Okta', status: 'idle', errors: {} },
    },
    {
      step: 'sso',
      variant: 'awaiting popup',
      state: {
        step: 'sso',
        identifier: 'dev@acmecorp.com',
        providerName: 'Okta',
        status: 'awaiting_popup',
        errors: {},
      },
    },
    {
      step: 'sso',
      variant: 'failed',
      state: {
        step: 'sso',
        identifier: 'dev@acmecorp.com',
        providerName: 'Okta',
        status: 'error',
        errors: { form: 'Verification was cancelled or failed.' },
      },
    },
    { step: 'success', variant: 'added', state: { step: 'success', identifier: 'new@clerk.dev' } },
  ];

  return (
    <div style={storyColumn}>
      <div style={controlsBar}>
        <SnapshotPicker
          selected={open ? index : null}
          snapshots={snapshots}
          onSelect={pick => {
            setIndex(pick);
            setOpen(true);
          }}
        />
        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <AddContactDialogView
            kind='email'
            state={snapshots[index].state}
            {...actions}
          />
        </Dialog>
      </div>
    </div>
  );
}

/** What a profile snapshot renders, since the three forms take different props. */
type ProfileSnapshotState =
  | { field: 'name'; state: EditNameState }
  | { field: 'username'; state: EditUsernameState }
  | { field: 'avatar'; state: EditAvatarState };

/**
 * Every rendered state of the three profile-field forms. Same contract as `States`, for the
 * single-step surfaces: no backend, one snapshot in, one surface out.
 */
export function ProfileStates() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const noop = () => undefined;
  const close = () => setOpen(false);

  const snapshots: readonly Snapshot<ProfileSnapshotState>[] = [
    {
      step: 'name',
      variant: 'idle',
      state: {
        field: 'name',
        state: { firstName: 'Preston', lastName: 'Booth', isSubmitting: false, isReadOnly: false, errors: {} },
      },
    },
    {
      step: 'name',
      variant: 'field error',
      state: {
        field: 'name',
        state: {
          firstName: '',
          lastName: 'Booth',
          isSubmitting: false,
          isReadOnly: false,
          errors: { firstName: 'Enter a first name.' },
        },
      },
    },
    {
      step: 'name',
      variant: 'saving',
      state: {
        field: 'name',
        state: { firstName: 'Preston', lastName: 'Booth', isSubmitting: true, isReadOnly: false, errors: {} },
      },
    },
    {
      step: 'name',
      variant: 'read-only',
      state: {
        field: 'name',
        state: { firstName: 'Preston', lastName: 'Booth', isSubmitting: false, isReadOnly: true, errors: {} },
      },
    },
    {
      step: 'username',
      variant: 'set',
      state: { field: 'username', state: { value: '', hasUsername: false, isSubmitting: false, errors: {} } },
    },
    {
      step: 'username',
      variant: 'update',
      state: {
        field: 'username',
        state: { value: 'prestonxyz', hasUsername: true, isSubmitting: false, errors: {} },
      },
    },
    {
      step: 'username',
      variant: 'taken',
      state: {
        field: 'username',
        state: {
          value: 'prestonxyz',
          hasUsername: true,
          isSubmitting: false,
          errors: { field: 'That username is taken. Please try another.' },
        },
      },
    },
    {
      step: 'username',
      variant: 'saving',
      state: { field: 'username', state: { value: 'preston', hasUsername: true, isSubmitting: true, errors: {} } },
    },
    {
      step: 'avatar',
      variant: 'idle',
      state: { field: 'avatar', state: { canRemove: false, status: 'idle', errors: {} } },
    },
    {
      step: 'avatar',
      variant: 'staged',
      state: {
        field: 'avatar',
        state: { fileName: 'headshot.png', canRemove: true, status: 'idle', errors: {} },
      },
    },
    {
      step: 'avatar',
      variant: 'rejected type',
      state: {
        field: 'avatar',
        state: { canRemove: true, status: 'idle', errors: { field: 'Use a PNG, JPEG, GIF or WebP image.' } },
      },
    },
    {
      step: 'avatar',
      variant: 'too large',
      state: {
        field: 'avatar',
        state: { canRemove: true, status: 'idle', errors: { field: 'That image is larger than 10MB.' } },
      },
    },
    {
      step: 'avatar',
      variant: 'uploading',
      state: {
        field: 'avatar',
        state: { fileName: 'headshot.png', canRemove: true, status: 'uploading', errors: {} },
      },
    },
    {
      step: 'avatar',
      variant: 'removing',
      state: { field: 'avatar', state: { canRemove: true, status: 'removing', errors: {} } },
    },
  ];

  const current = snapshots[index].state;

  return (
    <div style={storyColumn}>
      <div style={controlsBar}>
        <SnapshotPicker
          selected={open ? index : null}
          snapshots={snapshots}
          onSelect={pick => {
            setIndex(pick);
            setOpen(true);
          }}
        />
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        {current.field === 'name' ? (
          <EditNameDialogView
            state={current.state}
            onCancel={close}
            onFirstNameChange={noop}
            onLastNameChange={noop}
            onSubmit={noop}
          />
        ) : null}
        {current.field === 'username' ? (
          <EditUsernameDialogView
            state={current.state}
            onCancel={close}
            onSubmit={noop}
            onValueChange={noop}
          />
        ) : null}
        {current.field === 'avatar' ? (
          <EditAvatarDialogView
            fallback='PB'
            state={current.state}
            onCancel={close}
            onRemove={noop}
            onSelectFile={noop}
            onSubmit={noop}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
