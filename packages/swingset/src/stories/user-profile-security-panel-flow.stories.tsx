import type {
  ReverificationChallengeState,
  UserProfileSecurityPanelFlows,
  UserProfileSecurityReverificationOperation,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useId, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.harness';
import {
  DEFAULT_SECURITY_FLOW_CONFIG,
  useUserProfileSecurityPanelFlow,
} from './user-profile-security-panel-flow.harness';
import { SECURITY_FLOW_SNAPSHOTS, type SecuritySnapshot } from './user-profile-security-panel-flow.snapshots';

export { default as __source } from './user-profile-security-panel-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileSecurityPanelFlow',
  label: 'Security panel',
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
    details: {
      title: 'Macbook Pro · Chrome',
      lastActiveAtLabel: 'Last active 4 days ago',
      deviceName: 'Macbook Pro',
      browserName: 'Chrome 150.0.0.0',
      ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
      location: 'Salt Lake City, UT, United States',
      locationFlag: '🇺🇸',
      originalSignInAtLabel: 'July 5th, 2026',
    },
  },
];

function downloadBackupCodes(codes: string[]) {
  const url = URL.createObjectURL(new Blob([codes.join('\n')], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clerk-backup-codes.txt';
  link.click();
  URL.revokeObjectURL(url);
}

function securityPanelFlows(flow: ReturnType<typeof useUserProfileSecurityPanelFlow>): UserProfileSecurityPanelFlows {
  return {
    passwordTriggerRef: flow.passwordTriggerRef,
    passkeysTriggerRef: flow.passkeysTriggerRef,
    mfaTriggerRef: flow.mfaTriggerRef,
    deleteTriggerRef: flow.deleteTriggerRef,
    activeDevicesTriggerRef: flow.activeDevicesTriggerRef,
    password: flow.password
      ? {
          state: flow.password,
          onCancel: flow.closePassword,
          onValueChange: flow.updatePasswordValue,
          onSubmit: flow.submitPassword,
        }
      : null,
    renamePasskey: flow.renamePasskey
      ? {
          state: flow.renamePasskey,
          onCancel: flow.closeRenamePasskey,
          onNameChange: flow.updatePasskeyName,
          onRename: flow.submitRenamePasskey,
        }
      : null,
    removePasskey: flow.removePasskey
      ? {
          state: flow.removePasskey,
          onCancel: flow.closeRemovePasskey,
          onRemove: flow.submitRemovePasskey,
        }
      : null,
    addMfa: flow.addMfa
      ? {
          state: flow.addMfa,
          onCancel: flow.closeAddMfa,
          onCodeChange: flow.updateMfaCode,
          onAddPhone: flow.addNewMfaPhone,
          onSelectPhone: flow.selectMfaPhone,
          onPhoneNumberChange: flow.updateMfaPhoneNumber,
          onResend: () => void flow.resendMfaCode(),
          onBack: flow.backAddMfa,
          onSubmit: code => void flow.submitAddMfa(code),
          onToggleDisplayFormat: flow.toggleMfaDisplayFormat,
          onCopySecret: flow.copyMfaSecret,
          onCopyBackupCodes: () => {
            if (flow.addMfa?.step === 'backup-codes') {
              void navigator.clipboard?.writeText(flow.addMfa.codes.join('\n'));
              flow.markMfaBackupCodesCopied();
            }
          },
          onDownloadBackupCodes: () => {
            if (flow.addMfa?.step === 'backup-codes') {
              downloadBackupCodes(flow.addMfa.codes);
            }
          },
          onPrintBackupCodes: () => window.print(),
          onFinish: flow.finishAddMfa,
        }
      : null,
    removeMfa: flow.removeMfa
      ? {
          state: flow.removeMfa,
          onCancel: flow.closeRemoveMfa,
          onRemove: flow.submitRemoveMfa,
        }
      : null,
    backupCodes: flow.backupCodes
      ? {
          state: flow.backupCodes,
          onCancel: flow.closeBackupCodes,
          onRetry: flow.regenerateBackupCodes,
          onCopyAndClose: () => {
            if (flow.backupCodes?.step === 'codes') {
              void navigator.clipboard?.writeText(flow.backupCodes.codes.join('\n'));
              flow.closeBackupCodes();
            }
          },
          onDownload: () => {
            if (flow.backupCodes?.step === 'codes') {
              downloadBackupCodes(flow.backupCodes.codes);
            }
          },
          onPrint: () => window.print(),
        }
      : null,
    deleteAccount: flow.deleteAccount
      ? {
          state: flow.deleteAccount,
          onCancel: flow.closeDeleteAccount,
          onConfirmationChange: flow.updateDeleteConfirmation,
          onDelete: flow.submitDeleteAccount,
        }
      : null,
    signOutAllDevices: flow.signOutAllDevices
      ? {
          state: flow.signOutAllDevices,
          onCancel: flow.closeSignOutAllDevices,
          onSignOut: flow.submitSignOutAllDevices,
        }
      : null,
    device: flow.device
      ? {
          state: flow.device,
          onCancel: flow.closeDevice,
          onSignOut: () => flow.signOutDevice(flow.device?.device.id ?? ''),
        }
      : null,
    reverification: flow.reverification
      ? {
          operation: flow.reverification.operation,
          state: flow.reverification.state,
          onCancel: flow.cancelReverification,
          onResend: () => void flow.resendReverification(),
          onSubmit: value => void flow.submitVerification(value),
          onValueChange: flow.updateVerificationValue,
        }
      : null,
  };
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

function Controls({ config, onChange }: { config: SecurityFlowConfig; onChange: (next: SecurityFlowConfig) => void }) {
  const reverificationStrategies: ReverificationChallengeState['strategy'][] = [
    ...(config.hasPassword ? (['password'] as const) : []),
    'email_code',
    ...(config.hasMfaPhone ? (['phone_code'] as const) : []),
    ...(config.hasPasskey ? (['passkey'] as const) : []),
    ...(config.hasMfaAuthenticator ? (['totp'] as const) : []),
    ...(config.hasBackupCodes && (config.hasMfaPhone || config.hasMfaAuthenticator) ? (['backup_code'] as const) : []),
  ];

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
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'password'
                  ? 'email_code'
                  : config.reverificationStrategy,
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
          onChange={event =>
            onChange({
              ...config,
              hasPassword: event.target.checked,
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'password'
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Password already set</span>
      </label>
      <label style={{ ...controlLabel, opacity: config.passwordAvailable ? 1 : 0.5 }}>
        <input
          checked={config.passwordReadOnly}
          disabled={!config.passwordAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, passwordReadOnly: event.target.checked })}
        />
        <span style={controlName}>Enterprise-managed password</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.passkeysAvailable}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              passkeysAvailable: event.target.checked,
              hasPasskey: event.target.checked ? config.hasPasskey : false,
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'passkey'
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Passkey authentication</span>
      </label>
      <label style={{ ...controlLabel, opacity: config.passkeysAvailable ? 1 : 0.5 }}>
        <input
          checked={config.hasPasskey}
          disabled={!config.passkeysAvailable}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              hasPasskey: event.target.checked,
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'passkey'
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Passkey already added</span>
      </label>
      <label style={{ ...controlLabel, opacity: config.passkeysAvailable ? 1 : 0.5 }}>
        <input
          checked={config.passkeyCreationAvailable}
          disabled={!config.passkeysAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, passkeyCreationAvailable: event.target.checked })}
        />
        <span style={controlName}>Passkey creation available</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.mfaPhoneAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, mfaPhoneAvailable: event.target.checked })}
        />
        <span style={controlName}>Phone verification available</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.mfaAuthenticatorAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, mfaAuthenticatorAvailable: event.target.checked })}
        />
        <span style={controlName}>Authenticator app available</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.hasMfaPhone}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              hasMfaPhone: event.target.checked,
              hasBackupCodes: event.target.checked || config.hasMfaAuthenticator ? config.hasBackupCodes : false,
              reverificationStrategy:
                !event.target.checked &&
                (config.reverificationStrategy === 'phone_code' ||
                  (!config.hasMfaAuthenticator && config.reverificationStrategy === 'backup_code'))
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Phone number verification</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.hasMfaAuthenticator}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              hasMfaAuthenticator: event.target.checked,
              hasBackupCodes: event.target.checked || config.hasMfaPhone ? config.hasBackupCodes : false,
              reverificationStrategy:
                !event.target.checked &&
                (config.reverificationStrategy === 'totp' ||
                  (!config.hasMfaPhone && config.reverificationStrategy === 'backup_code'))
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Authenticator app</span>
      </label>
      <RadioGroup
        legend='Available phone to enroll'
        options={['none', 'verified', 'unverified'] as const}
        value={config.availableMfaPhone}
        onChange={availableMfaPhone => onChange({ ...config, availableMfaPhone })}
      />
      <label style={controlLabel}>
        <input
          checked={config.backupCodesAvailable}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              backupCodesAvailable: event.target.checked,
              hasBackupCodes: event.target.checked ? config.hasBackupCodes : false,
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'backup_code'
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Instance generates backup codes</span>
      </label>
      <RadioGroup
        disabled={!config.backupCodesAvailable}
        legend='Backup code result'
        options={['success', 'unavailable'] as const}
        value={config.backupCodeCreationResult}
        onChange={backupCodeCreationResult => onChange({ ...config, backupCodeCreationResult })}
      />
      <label style={{ ...controlLabel, opacity: config.hasMfaPhone || config.hasMfaAuthenticator ? 1 : 0.5 }}>
        <input
          checked={config.hasBackupCodes}
          disabled={!config.backupCodesAvailable || (!config.hasMfaPhone && !config.hasMfaAuthenticator)}
          type='checkbox'
          onChange={event =>
            onChange({
              ...config,
              hasBackupCodes: event.target.checked,
              reverificationStrategy:
                !event.target.checked && config.reverificationStrategy === 'backup_code'
                  ? 'email_code'
                  : config.reverificationStrategy,
            })
          }
        />
        <span style={controlName}>Backup codes exist</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.mfaRequired}
          type='checkbox'
          onChange={event => onChange({ ...config, mfaRequired: event.target.checked })}
        />
        <span style={controlName}>Two-step verification required</span>
      </label>
      <RadioGroup
        disabled={!config.mfaPhoneAvailable && !config.mfaAuthenticatorAvailable}
        legend='MFA verification result'
        options={['success', 'server-error'] as const}
        value={config.mfaVerificationResult}
        onChange={mfaVerificationResult => onChange({ ...config, mfaVerificationResult })}
      />
      <label style={controlLabel}>
        <input
          checked={config.deleteAccountAvailable}
          type='checkbox'
          onChange={event => onChange({ ...config, deleteAccountAvailable: event.target.checked })}
        />
        <span style={controlName}>Self-service account deletion</span>
      </label>
      <label style={controlLabel}>
        <input
          checked={config.otherSessionsCount > 0}
          type='checkbox'
          onChange={event => onChange({ ...config, otherSessionsCount: event.target.checked ? 1 : 0 })}
        />
        <span style={controlName}>Another signed-in account</span>
      </label>
      <RadioGroup
        legend='Active devices request'
        options={['ready', 'loading', 'error'] as const}
        value={config.devicesStatus}
        onChange={devicesStatus => onChange({ ...config, devicesStatus })}
      />
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
        options={reverificationStrategies}
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
  const [deleteCompletion, setDeleteCompletion] = useState<{ session: null; redirectUrl: string } | null>(null);
  const flow = useUserProfileSecurityPanelFlow({
    config,
    initialDevices: INITIAL_DEVICES,
    onHasPasswordChange: hasPassword => setConfig(current => ({ ...current, hasPassword })),
    onHasPasskeyChange: hasPasskey => setConfig(current => ({ ...current, hasPasskey })),
    onBackupCodesChange: hasBackupCodes => setConfig(current => ({ ...current, hasBackupCodes })),
    onMfaMethodChange: (method, enabled) =>
      setConfig(current => {
        const hasMfaPhone = method === 'sms' ? enabled : current.hasMfaPhone;
        const hasMfaAuthenticator = method === 'authenticator' ? enabled : current.hasMfaAuthenticator;
        return {
          ...current,
          hasMfaPhone,
          hasMfaAuthenticator,
          hasBackupCodes: hasMfaPhone || hasMfaAuthenticator ? current.hasBackupCodes : false,
          reverificationStrategy:
            !enabled &&
            (current.reverificationStrategy === (method === 'sms' ? 'phone_code' : 'totp') ||
              (!hasMfaPhone && !hasMfaAuthenticator && current.reverificationStrategy === 'backup_code'))
              ? 'email_code'
              : current.reverificationStrategy,
        };
      }),
    otherSessionsCount: config.otherSessionsCount,
    onSetActive: setDeleteCompletion,
  });

  return (
    <div style={storyColumn}>
      <Controls
        config={config}
        onChange={setConfig}
      />
      <UserProfileSecurityPanelView
        {...securityPanelFlows(flow)}
        devices={config.devicesStatus === 'ready' ? flow.devices : []}
        devicesError={config.devicesStatus === 'error' ? 'Sessions are unavailable.' : undefined}
        devicesStatus={config.devicesStatus}
        deviceSignOutState={flow.deviceSignOut}
        hasPassword={flow.hasPassword}
        mfaMethods={
          config.mfaPhoneAvailable || config.mfaAuthenticatorAvailable || config.backupCodesAvailable
            ? flow.mfaMethods
            : undefined
        }
        mfaAddableMethods={[
          ...(config.mfaPhoneAvailable ? (['sms'] as const) : []),
          ...(config.mfaAuthenticatorAvailable ? (['authenticator'] as const) : []),
        ]}
        passkeys={config.passkeysAvailable ? flow.passkeys : undefined}
        passwordAvailable={config.passwordAvailable}
        passkeyCreationState={flow.passkeyCreation}
        onAddPasskey={config.passkeysAvailable && config.passkeyCreationAvailable ? flow.addPasskey : undefined}
        onChangePassword={config.passwordAvailable ? flow.openPassword : undefined}
        onAddMfaMethod={config.mfaPhoneAvailable || config.mfaAuthenticatorAvailable ? flow.openAddMfa : undefined}
        onDeleteAccount={config.deleteAccountAvailable ? flow.openDeleteAccount : undefined}
        onEnableBackupCodes={config.backupCodesAvailable ? flow.openBackupCodes : undefined}
        onManageDevice={flow.openDevice}
        onManagePasskey={flow.openRenamePasskey}
        onRemoveMfaMethod={flow.openRemoveMfa}
        onRegenerateBackupCodes={flow.openBackupCodes}
        onSetDefaultMfaMethod={flow.setDefaultMfa}
        onRemovePasskey={flow.openRemovePasskey}
        onSignOutAllOtherDevices={flow.openSignOutAllDevices}
        onSignOutDevice={flow.signOutDevice}
      />
      {deleteCompletion ? <output>Active session cleared; redirect to {deleteCompletion.redirectUrl}</output> : null}
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

export function States() {
  return <SecurityFlowStates />;
}

const noop = () => undefined;

function snapshotOperation(flow: SecuritySnapshot['flow']): UserProfileSecurityReverificationOperation | null {
  if (flow === 'rename-passkey') {
    return null;
  }
  return flow === 'device' ? 'sign-out-device' : flow;
}

function snapshotPanelFlows(
  snapshot: SecuritySnapshot,
  open: boolean,
  verificationOpen: boolean,
  onClose: () => void,
  onVerificationClose: () => void,
): UserProfileSecurityPanelFlows {
  if (!open) {
    return {};
  }

  const operation = snapshotOperation(snapshot.flow);
  const reverification =
    verificationOpen && snapshot.reverification && operation
      ? {
          operation,
          state: snapshot.reverification,
          onCancel: onVerificationClose,
          onResend: noop,
          onSubmit: noop,
          onValueChange: noop,
        }
      : null;

  switch (snapshot.flow) {
    case 'password':
      return {
        reverification,
        password: {
          state: snapshot.state,
          onCancel: onClose,
          onSubmit: noop,
          onValueChange: noop,
        },
      };
    case 'add-passkey':
      return { reverification };
    case 'rename-passkey':
      return {
        renamePasskey: {
          state: snapshot.state,
          onCancel: onClose,
          onNameChange: noop,
          onRename: noop,
        },
      };
    case 'remove-passkey':
      return {
        reverification,
        removePasskey: { state: snapshot.state, onCancel: onClose, onRemove: noop },
      };
    case 'add-mfa':
      return {
        reverification,
        addMfa: {
          state: snapshot.state,
          onAddPhone: noop,
          onBack: noop,
          onCancel: onClose,
          onCodeChange: noop,
          onCopyBackupCodes: noop,
          onCopySecret: noop,
          onDownloadBackupCodes: noop,
          onFinish: noop,
          onPhoneNumberChange: noop,
          onPrintBackupCodes: noop,
          onResend: noop,
          onSelectPhone: noop,
          onSubmit: noop,
          onToggleDisplayFormat: noop,
        },
      };
    case 'remove-mfa':
      return {
        reverification,
        removeMfa: { state: snapshot.state, onCancel: onClose, onRemove: noop },
      };
    case 'backup-codes':
      return {
        reverification,
        backupCodes: {
          state: snapshot.state,
          onCancel: onClose,
          onCopyAndClose: onClose,
          onDownload: noop,
          onPrint: noop,
          onRetry: noop,
        },
      };
    case 'delete-account':
      return {
        reverification,
        deleteAccount: {
          state: snapshot.state,
          onCancel: onClose,
          onConfirmationChange: noop,
          onDelete: noop,
        },
      };
    case 'sign-out-all-devices':
      return {
        reverification,
        signOutAllDevices: { state: snapshot.state, onCancel: onClose, onSignOut: noop },
      };
    case 'device':
      return {
        reverification,
        device: { state: snapshot.state, onCancel: onClose, onSignOut: noop },
      };
  }
}

export function SecurityFlowStates({ flows }: { flows?: SecuritySnapshot['flow'][] } = {}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const snapshots = flows
    ? SECURITY_FLOW_SNAPSHOTS.filter(snapshot => flows.includes(snapshot.flow))
    : SECURITY_FLOW_SNAPSHOTS;
  const snapshot = snapshots[index] ?? snapshots[0];
  const isPasskeyFlow = snapshot.flow === 'add-passkey' || snapshot.flow.endsWith('-passkey');
  const isMfaFlow = snapshot.flow.endsWith('-mfa') || snapshot.flow === 'backup-codes';
  const isDeviceFlow = snapshot.flow === 'device' || snapshot.flow === 'sign-out-all-devices';

  return (
    <div style={storyColumn}>
      <div style={controlsBar}>
        <SnapshotPicker
          selected={open ? index : null}
          snapshots={snapshots}
          onSelect={nextIndex => {
            setIndex(nextIndex);
            setOpen(true);
            setVerificationOpen(Boolean(snapshots[nextIndex].reverification));
          }}
        />
      </div>
      <UserProfileSecurityPanelView
        {...snapshotPanelFlows(
          snapshot,
          open,
          verificationOpen,
          () => setOpen(false),
          () => setVerificationOpen(false),
        )}
        devices={isDeviceFlow ? INITIAL_DEVICES : undefined}
        hasPassword
        mfaMethods={isMfaFlow ? [] : undefined}
        passkeyCreationState={snapshot.flow === 'add-passkey' && open ? snapshot.state : null}
        passkeys={isPasskeyFlow ? [] : undefined}
        passwordAvailable={snapshot.flow === 'password'}
        onAddMfaMethod={isMfaFlow ? noop : undefined}
        onAddPasskey={isPasskeyFlow ? noop : undefined}
        onChangePassword={snapshot.flow === 'password' ? noop : undefined}
        onDeleteAccount={snapshot.flow === 'delete-account' ? noop : undefined}
        onSignOutAllOtherDevices={isDeviceFlow ? noop : undefined}
      />
    </div>
  );
}
