import { Freeze } from '@clerk/headless/utils';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type {
  ReverificationChallengeState,
  UserProfileDeleteAccountFlowState,
  UserProfilePasswordFlowState,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { ReverificationDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/reverification-dialog.view';
import { UserProfileDeleteAccountDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-account-dialog.view';
import { UserProfilePasswordDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSignOutAllDevicesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view';
import { useId, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import type { SecurityFlowConfig } from './user-profile-security-flow.harness';
import { DEFAULT_SECURITY_FLOW_CONFIG, useSecurityFlow } from './user-profile-security-flow.harness';

export { default as __source } from './user-profile-security-flows.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'SecurityFlows',
  label: 'Security flows',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/dialogs/flow.types.ts',
};

const INITIAL_DEVICES: UserProfileDevice[] = [
  {
    id: 'current',
    name: 'Safari on macOS',
    description: 'Salt Lake City, UT, United States',
    type: 'desktop',
    isCurrent: true,
  },
  {
    id: 'mobile',
    name: 'Safari on iOS',
    description: 'Last seen 2 weeks ago · Orem, UT, United States',
    type: 'mobile',
  },
  {
    id: 'desktop',
    name: 'Clerk App on macOS',
    description: 'Last seen May 14th, 2026 · San Francisco, CA, United States',
    type: 'desktop',
  },
];

function SecurityFlowDialogs({ flow }: { flow: ReturnType<typeof useSecurityFlow> }) {
  const verificationDialog = (operation: 'password' | 'delete-account' | 'sign-out-all-devices') => {
    const challenge = flow.reverification?.operation === operation ? flow.reverification.state : null;
    return (
      <Dialog
        open={Boolean(challenge)}
        onOpenChange={open => {
          if (!open) {
            flow.cancelReverification();
          }
        }}
      >
        <Freeze frozen={!challenge}>
          {challenge ? (
            <ReverificationDialogView
              state={challenge}
              onCancel={flow.cancelReverification}
              onResend={() => void flow.resendReverification()}
              onSubmit={() => void flow.submitVerification()}
              onValueChange={flow.updateVerificationValue}
            />
          ) : null}
        </Freeze>
      </Dialog>
    );
  };

  return (
    <>
      {flow.password ? (
        <UserProfilePasswordDialogView
          open
          state={flow.password}
          canSubmit={
            Boolean(flow.password.values.newPassword) &&
            flow.password.values.newPassword === flow.password.values.confirmPassword
          }
          onOpenChange={open => {
            if (!open) {
              flow.closePassword();
            }
          }}
          onValueChange={flow.updatePasswordValue}
          onSubmit={flow.submitPassword}
          verificationDialog={verificationDialog('password')}
        />
      ) : null}
      {flow.deleteAccount ? (
        <UserProfileDeleteAccountDialogView
          open
          state={flow.deleteAccount}
          onOpenChange={open => {
            if (!open) {
              flow.closeDeleteAccount();
            }
          }}
          onConfirmationChange={flow.updateDeleteConfirmation}
          onDelete={flow.submitDeleteAccount}
          verificationDialog={verificationDialog('delete-account')}
        />
      ) : null}
      {flow.signOutAllDevices ? (
        <UserProfileSignOutAllDevicesDialogView
          open
          state={flow.signOutAllDevices}
          onOpenChange={open => {
            if (!open) {
              flow.closeSignOutAllDevices();
            }
          }}
          onSignOut={flow.submitSignOutAllDevices}
          verificationDialog={verificationDialog('sign-out-all-devices')}
        />
      ) : null}
    </>
  );
}

const storyColumn = { display: 'flex', flexDirection: 'column', width: '100%' } as const;
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
const controlName = { fontWeight: 600 } as const;
const radioGroup = { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '0.375rem 0.75rem' } as const;
const radioOption = { alignItems: 'center', display: 'flex', gap: '0.25rem' } as const;

function RadioGroup<Value extends string>({
  disabled = false,
  legend,
  options,
  value,
  onChange,
}: {
  disabled?: boolean;
  legend: string;
  options: readonly Value[];
  value: Value;
  onChange: (value: Value) => void;
}) {
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

const REVERIFICATION_STRATEGIES = ['password', 'email_code', 'phone_code', 'passkey', 'totp', 'backup_code'] as const;

function Controls({ config, onChange }: { config: SecurityFlowConfig; onChange: (next: SecurityFlowConfig) => void }) {
  return (
    <div style={controlsBar}>
      <label style={controlLabel}>
        <span style={controlName}>Latency</span>
        <input
          max={4000}
          min={0}
          step={100}
          type='range'
          value={config.latencyMs}
          onChange={event => onChange({ ...config, latencyMs: Number(event.target.value) })}
        />
        {config.latencyMs}ms
      </label>
      <label style={controlLabel}>
        <input
          checked={config.passwordAvailable}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              passwordAvailable: event.target.checked,
              hasPassword: event.target.checked ? config.hasPassword : false,
            })
          }
        />
        <span style={controlName}>Password-based authentication</span>
      </label>
      <label style={{ ...controlLabel, opacity: config.passwordAvailable ? 1 : 0.5 }}>
        <input
          checked={config.hasPassword}
          disabled={!config.passwordAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, hasPassword: event.target.checked })}
        />
        <span style={controlName}>Password already set</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.requireReverification}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              requireReverification: event.target.checked,
              failurePoint:
                !event.target.checked &&
                (config.failurePoint === 'reverification' || config.failurePoint === 'retried-mutation')
                  ? 'none'
                  : config.failurePoint,
            })
          }
        />
        <span style={controlName}>Require reverification</span>
      </label>
      <RadioGroup
        disabled={!config.requireReverification}
        legend='Reverification method'
        options={REVERIFICATION_STRATEGIES}
        value={config.reverificationStrategy}
        onChange={reverificationStrategy => onChange({ ...config, reverificationStrategy })}
      />
      <RadioGroup
        legend='Failure point'
        options={
          config.requireReverification
            ? (['none', 'initial-request', 'reverification', 'retried-mutation'] as const)
            : (['none', 'initial-request'] as const)
        }
        value={config.failurePoint}
        onChange={failurePoint => onChange({ ...config, failurePoint })}
      />
      <span style={{ opacity: 0.7 }}>
        code <code>{config.validCode}</code> · password <code>{config.validPassword}</code>
      </span>
    </div>
  );
}

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = useSecurityFlow({
    config,
    initialDevices: INITIAL_DEVICES,
    onHasPasswordChange: hasPassword => setConfig(current => ({ ...current, hasPassword })),
  });

  return (
    <div style={storyColumn}>
      <Controls
        config={config}
        onChange={setConfig}
      />
      <UserProfileSecurityPanelView
        devices={flow.devices}
        hasPassword={flow.hasPassword}
        passwordAvailable={config.passwordAvailable}
        onChangePassword={config.passwordAvailable ? flow.openPassword : undefined}
        onDeleteAccount={flow.openDeleteAccount}
        onManageDevice={() => undefined}
        onSignOutAllOtherDevices={flow.openSignOutAllDevices}
        onSignOutDevice={() => undefined}
      />
      <SecurityFlowDialogs flow={flow} />
    </div>
  );
}

interface Snapshot<State> {
  step: string;
  variant: string;
  state: State;
  reverification?: ReverificationChallengeState;
}

type SecuritySnapshot =
  | ({ flow: 'password' } & Snapshot<UserProfilePasswordFlowState>)
  | ({ flow: 'delete-account' } & Snapshot<UserProfileDeleteAccountFlowState>)
  | ({ flow: 'sign-out-all-devices' } & Snapshot<UserProfileSignOutAllDevicesFlowState>);

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
  backgroundColor: 'transparent',
  border: '1px solid var(--cl-color-border)',
  borderRadius: '0.375rem',
  color: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  font: 'inherit',
  gap: '0.25rem',
  padding: '0.125rem 0.5rem',
} as const;
const snapshotChipSelected = {
  ...snapshotChip,
  backgroundColor: 'var(--cl-color-primary-faded)',
  borderColor: 'var(--cl-color-primary)',
  fontWeight: 600,
} as const;

function SnapshotPicker({
  snapshots,
  selected,
  onSelect,
}: {
  snapshots: readonly SecuritySnapshot[];
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const steps = [...new Set(snapshots.map(snapshot => snapshot.step))];

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

const passwordValues = {
  newPassword: 'correct-horse',
  confirmPassword: 'correct-horse',
  signOutOfOtherSessions: true,
};
const idleVerification: ReverificationChallengeState = {
  strategy: 'email_code',
  identifier: 'i••••@clerk.dev',
  value: '',
  status: 'idle',
  errors: {},
  resend: { isResending: false, secondsRemaining: 0 },
};

const SNAPSHOTS: readonly SecuritySnapshot[] = [
  {
    flow: 'password',
    step: 'password',
    variant: 'change',
    state: {
      mode: 'change',
      values: { ...passwordValues, newPassword: '', confirmPassword: '' },
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'password',
    step: 'password',
    variant: 'set',
    state: {
      mode: 'set',
      values: { ...passwordValues, newPassword: '', confirmPassword: '' },
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'password',
    step: 'password',
    variant: 'mismatch',
    state: {
      mode: 'change',
      values: { ...passwordValues, confirmPassword: 'different-password' },
      isSubmitting: false,
      errors: { confirmPassword: 'Passwords do not match.' },
    },
  },
  {
    flow: 'password',
    step: 'password',
    variant: 'submitting',
    state: { mode: 'change', values: passwordValues, isSubmitting: true, errors: {} },
  },
  {
    flow: 'password',
    step: 'password',
    variant: 'server error',
    state: {
      mode: 'change',
      values: passwordValues,
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'password',
    step: 'password',
    variant: 'reverification',
    state: { mode: 'change', values: passwordValues, isSubmitting: true, errors: {} },
    reverification: idleVerification,
  },
  {
    flow: 'password',
    step: 'reverification',
    variant: 'verifying',
    state: { mode: 'change', values: passwordValues, isSubmitting: true, errors: {} },
    reverification: { ...idleVerification, value: '424242', status: 'verifying' },
  },
  {
    flow: 'password',
    step: 'reverification',
    variant: 'wrong code',
    state: { mode: 'change', values: passwordValues, isSubmitting: true, errors: {} },
    reverification: { ...idleVerification, status: 'error', errors: { field: 'Incorrect code. Please try again.' } },
  },
  {
    flow: 'password',
    step: 'reverification',
    variant: 'server error',
    state: { mode: 'change', values: passwordValues, isSubmitting: true, errors: {} },
    reverification: {
      ...idleVerification,
      value: '424242',
      status: 'error',
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'delete-account',
    step: 'delete account',
    variant: 'idle',
    state: { confirmation: '', isSubmitting: false, errors: {} },
  },
  {
    flow: 'delete-account',
    step: 'delete account',
    variant: 'ready',
    state: { confirmation: 'Delete account', isSubmitting: false, errors: {} },
  },
  {
    flow: 'delete-account',
    step: 'delete account',
    variant: 'submitting',
    state: { confirmation: 'Delete account', isSubmitting: true, errors: {} },
  },
  {
    flow: 'delete-account',
    step: 'delete account',
    variant: 'server error',
    state: {
      confirmation: 'Delete account',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'delete-account',
    step: 'delete account',
    variant: 'reverification',
    state: { confirmation: 'Delete account', isSubmitting: true, errors: {} },
    reverification: idleVerification,
  },
  {
    flow: 'sign-out-all-devices',
    step: 'sign out all',
    variant: 'idle',
    state: { isSubmitting: false, errors: {} },
  },
  {
    flow: 'sign-out-all-devices',
    step: 'sign out all',
    variant: 'submitting',
    state: { isSubmitting: true, errors: {} },
  },
  {
    flow: 'sign-out-all-devices',
    step: 'sign out all',
    variant: 'server error',
    state: { isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } },
  },
  {
    flow: 'sign-out-all-devices',
    step: 'sign out all',
    variant: 'reverification',
    state: { isSubmitting: true, errors: {} },
    reverification: idleVerification,
  },
];

export function States() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const snapshot = SNAPSHOTS[index];
  const noop = () => undefined;
  const verification = snapshot.reverification ? (
    <Dialog
      open={verificationOpen}
      onOpenChange={setVerificationOpen}
    >
      <ReverificationDialogView
        state={snapshot.reverification}
        onCancel={() => setVerificationOpen(false)}
        onResend={noop}
        onSubmit={noop}
        onValueChange={noop}
      />
    </Dialog>
  ) : null;

  return (
    <div style={storyColumn}>
      <div style={controlsBar}>
        <SnapshotPicker
          selected={open ? index : null}
          snapshots={SNAPSHOTS}
          onSelect={nextIndex => {
            setIndex(nextIndex);
            setOpen(true);
            setVerificationOpen(Boolean(SNAPSHOTS[nextIndex].reverification));
          }}
        />
      </div>
      {snapshot.flow === 'password' ? (
        <UserProfilePasswordDialogView
          open={open}
          state={snapshot.state}
          canSubmit={Boolean(snapshot.state.values.newPassword)}
          onOpenChange={setOpen}
          onValueChange={noop}
          onSubmit={noop}
          verificationDialog={verification}
        />
      ) : null}
      {snapshot.flow === 'delete-account' ? (
        <UserProfileDeleteAccountDialogView
          open={open}
          state={snapshot.state}
          onOpenChange={setOpen}
          onConfirmationChange={noop}
          onDelete={noop}
          verificationDialog={verification}
        />
      ) : null}
      {snapshot.flow === 'sign-out-all-devices' ? (
        <UserProfileSignOutAllDevicesDialogView
          open={open}
          state={snapshot.state}
          onOpenChange={setOpen}
          onSignOut={noop}
          verificationDialog={verification}
        />
      ) : null}
    </div>
  );
}
