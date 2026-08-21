import { Freeze } from '@clerk/headless/utils';
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type { ReverificationChallengeState } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { ReverificationDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/reverification-dialog.view';
import { UserProfileBackupCodesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-backup-codes-dialog.view';
import { UserProfileDeleteAccountDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-account-dialog.view';
import { UserProfileDeviceDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import {
  UserProfileMfaAddDialogView,
  UserProfileMfaRemoveDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-mfa-dialog.view';
import {
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-passkey-dialog.view';
import { UserProfilePasskeysSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';
import { UserProfilePasswordDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSignOutAllDevicesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view';
import { useId, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.harness';
import {
  DEFAULT_SECURITY_FLOW_CONFIG,
  useUserProfileSecurityPanelFlow,
} from './user-profile-security-panel-flow.harness';
import type { SecurityReverificationOperation } from './user-profile-security-panel-flow.reverification';
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

function UserProfileSecurityPanelFlowDialogs({ flow }: { flow: ReturnType<typeof useUserProfileSecurityPanelFlow> }) {
  const verificationDialog = (operation: SecurityReverificationOperation) => {
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
              onSubmit={value => void flow.submitVerification(value)}
              onValueChange={flow.updateVerificationValue}
            />
          ) : null}
        </Freeze>
      </Dialog>
    );
  };

  return (
    <>
      <FlowCardDialog
        finalFocus={flow.passwordTriggerRef}
        open={Boolean(flow.password)}
        onOpenChange={open => {
          if (!open && !flow.password?.isSubmitting) {
            flow.closePassword();
          }
        }}
      >
        <Freeze frozen={!flow.password}>
          {flow.password ? (
            <UserProfilePasswordDialogView
              state={flow.password}
              isInterrupted={flow.reverification?.operation === 'password'}
              onCancel={flow.closePassword}
              onValueChange={flow.updatePasswordValue}
              onSubmit={flow.submitPassword}
            />
          ) : null}
        </Freeze>
        {verificationDialog('password')}
      </FlowCardDialog>
      {verificationDialog('add-passkey')}
      <FlowCardDialog
        finalFocus={flow.passkeysTriggerRef}
        open={Boolean(flow.renamePasskey)}
        onOpenChange={open => {
          if (!open && !flow.renamePasskey?.isSubmitting) {
            flow.closeRenamePasskey();
          }
        }}
      >
        <Freeze frozen={!flow.renamePasskey}>
          {flow.renamePasskey ? (
            <UserProfilePasskeyRenameDialogView
              state={flow.renamePasskey}
              isInterrupted={false}
              onCancel={flow.closeRenamePasskey}
              onNameChange={flow.updatePasskeyName}
              onRename={flow.submitRenamePasskey}
            />
          ) : null}
        </Freeze>
      </FlowCardDialog>
      <AlertDialog
        finalFocus={flow.passkeysTriggerRef}
        open={Boolean(flow.removePasskey)}
        onOpenChange={open => {
          if (!open && !flow.removePasskey?.isSubmitting) {
            flow.closeRemovePasskey();
          }
        }}
      >
        <Freeze frozen={!flow.removePasskey}>
          {flow.removePasskey ? (
            <UserProfilePasskeyRemoveDialogView
              state={flow.removePasskey}
              isInterrupted={flow.reverification?.operation === 'remove-passkey'}
              onCancel={flow.closeRemovePasskey}
              onRemove={flow.submitRemovePasskey}
            />
          ) : null}
        </Freeze>
        {verificationDialog('remove-passkey')}
      </AlertDialog>
      <FlowCardDialog
        size='card'
        finalFocus={flow.mfaTriggerRef}
        open={Boolean(flow.addMfa)}
        onOpenChange={open => {
          if (!open && !flow.addMfa?.isSubmitting) {
            flow.closeAddMfa();
          }
        }}
      >
        <Freeze frozen={!flow.addMfa}>
          {flow.addMfa ? (
            <UserProfileMfaAddDialogView
              state={flow.addMfa}
              isInterrupted={flow.reverification?.operation === 'add-mfa'}
              onCancel={flow.closeAddMfa}
              onCodeChange={flow.updateMfaCode}
              onAddPhone={flow.addNewMfaPhone}
              onSelectPhone={flow.selectMfaPhone}
              onPhoneNumberChange={flow.updateMfaPhoneNumber}
              onResend={() => void flow.resendMfaCode()}
              onBack={flow.backAddMfa}
              onSubmit={code => void flow.submitAddMfa(code)}
              onToggleDisplayFormat={flow.toggleMfaDisplayFormat}
              onCopySecret={flow.copyMfaSecret}
              onCopyBackupCodes={() => {
                if (flow.addMfa?.step === 'backup-codes') {
                  void navigator.clipboard?.writeText(flow.addMfa.codes.join('\n'));
                  flow.markMfaBackupCodesCopied();
                }
              }}
              onDownloadBackupCodes={() => {
                if (flow.addMfa?.step === 'backup-codes') {
                  downloadBackupCodes(flow.addMfa.codes);
                }
              }}
              onPrintBackupCodes={() => window.print()}
              onFinish={flow.finishAddMfa}
            />
          ) : null}
        </Freeze>
        {verificationDialog('add-mfa')}
      </FlowCardDialog>
      <AlertDialog
        finalFocus={flow.mfaTriggerRef}
        open={Boolean(flow.removeMfa)}
        onOpenChange={open => {
          if (!open && !flow.removeMfa?.isSubmitting) {
            flow.closeRemoveMfa();
          }
        }}
      >
        <Freeze frozen={!flow.removeMfa}>
          {flow.removeMfa ? (
            <UserProfileMfaRemoveDialogView
              state={flow.removeMfa}
              isInterrupted={flow.reverification?.operation === 'remove-mfa'}
              onCancel={flow.closeRemoveMfa}
              onRemove={flow.submitRemoveMfa}
            />
          ) : null}
        </Freeze>
        {verificationDialog('remove-mfa')}
      </AlertDialog>
      <FlowCardDialog
        size='card'
        finalFocus={flow.mfaTriggerRef}
        open={Boolean(flow.backupCodes)}
        onOpenChange={open => {
          if (!open && !flow.backupCodes?.isSubmitting) {
            flow.closeBackupCodes();
          }
        }}
      >
        <Freeze frozen={!flow.backupCodes}>
          {flow.backupCodes ? (
            <UserProfileBackupCodesDialogView
              state={flow.backupCodes}
              isInterrupted={flow.reverification?.operation === 'backup-codes'}
              onCancel={flow.closeBackupCodes}
              onRetry={flow.regenerateBackupCodes}
              onCopyAndClose={() => {
                if (flow.backupCodes?.step === 'codes') {
                  void navigator.clipboard?.writeText(flow.backupCodes.codes.join('\n'));
                  flow.closeBackupCodes();
                }
              }}
              onDownload={() => {
                if (flow.backupCodes?.step === 'codes') {
                  downloadBackupCodes(flow.backupCodes.codes);
                }
              }}
              onPrint={() => window.print()}
            />
          ) : null}
        </Freeze>
        {verificationDialog('backup-codes')}
      </FlowCardDialog>
      <AlertDialog
        finalFocus={flow.deleteTriggerRef}
        open={Boolean(flow.deleteAccount)}
        onOpenChange={open => {
          if (!open && !flow.deleteAccount?.isSubmitting) {
            flow.closeDeleteAccount();
          }
        }}
      >
        <Freeze frozen={!flow.deleteAccount}>
          {flow.deleteAccount ? (
            <UserProfileDeleteAccountDialogView
              state={flow.deleteAccount}
              isInterrupted={flow.reverification?.operation === 'delete-account'}
              onCancel={flow.closeDeleteAccount}
              onConfirmationChange={flow.updateDeleteConfirmation}
              onDelete={flow.submitDeleteAccount}
            />
          ) : null}
        </Freeze>
        {verificationDialog('delete-account')}
      </AlertDialog>
      <AlertDialog
        finalFocus={flow.activeDevicesTriggerRef}
        open={Boolean(flow.signOutAllDevices)}
        onOpenChange={open => {
          if (!open && !flow.signOutAllDevices?.isSubmitting) {
            flow.closeSignOutAllDevices();
          }
        }}
      >
        <Freeze frozen={!flow.signOutAllDevices}>
          {flow.signOutAllDevices ? (
            <UserProfileSignOutAllDevicesDialogView
              state={flow.signOutAllDevices}
              isInterrupted={flow.reverification?.operation === 'sign-out-all-devices'}
              onCancel={flow.closeSignOutAllDevices}
              onSignOut={flow.submitSignOutAllDevices}
            />
          ) : null}
        </Freeze>
        {verificationDialog('sign-out-all-devices')}
      </AlertDialog>
      <FlowCardDialog
        size='card'
        finalFocus={flow.activeDevicesTriggerRef}
        open={Boolean(flow.device)}
        onOpenChange={open => {
          if (!open && !flow.device?.isSubmitting) {
            flow.closeDevice();
          }
        }}
      >
        <Freeze frozen={!flow.device}>
          {flow.device ? (
            <UserProfileDeviceDialogView
              state={flow.device}
              isInterrupted={flow.reverification?.operation === 'sign-out-device'}
              onSignOut={() => flow.signOutDevice(flow.device?.device.id ?? '')}
            />
          ) : null}
        </Freeze>
      </FlowCardDialog>
      {verificationDialog('sign-out-device')}
    </>
  );
}

function FlowCardDialog({
  open,
  finalFocus,
  size = 'prompt',
  onOpenChange,
  children,
}: {
  open: boolean;
  finalFocus?: React.RefObject<HTMLElement | null>;
  size?: 'prompt' | 'card';
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root
      size={size}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            finalFocus={finalFocus}
            render={
              size === 'card' ? (
                <Card.Root
                  elevation='overlay'
                  renderBranding={false}
                />
              ) : undefined
            }
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
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
      <UserProfileSecurityPanelFlowDialogs flow={flow} />
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

export function SecurityFlowStates({ flows }: { flows?: SecuritySnapshot['flow'][] } = {}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const snapshots = flows
    ? SECURITY_FLOW_SNAPSHOTS.filter(snapshot => flows.includes(snapshot.flow))
    : SECURITY_FLOW_SNAPSHOTS;
  const snapshot = snapshots[index] ?? snapshots[0];
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
          snapshots={snapshots}
          onSelect={nextIndex => {
            setIndex(nextIndex);
            setOpen(true);
            setVerificationOpen(Boolean(snapshots[nextIndex].reverification));
          }}
        />
      </div>
      {snapshot.flow === 'password' ? (
        <FlowCardDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfilePasswordDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onValueChange={noop}
            onSubmit={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
      {snapshot.flow === 'add-passkey' ? (
        <div style={{ width: '100%' }}>
          <UserProfilePasskeysSectionView
            creationState={snapshot.state}
            passkeys={[]}
            onAdd={noop}
          />
          {verification}
        </div>
      ) : null}
      {snapshot.flow === 'rename-passkey' ? (
        <FlowCardDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfilePasskeyRenameDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onNameChange={noop}
            onRename={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
      {snapshot.flow === 'remove-passkey' ? (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfilePasskeyRemoveDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onRemove={noop}
          />
          {verification}
        </AlertDialog>
      ) : null}
      {snapshot.flow === 'add-mfa' ? (
        <FlowCardDialog
          size='card'
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileMfaAddDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onCodeChange={noop}
            onAddPhone={noop}
            onSelectPhone={noop}
            onPhoneNumberChange={noop}
            onResend={noop}
            onBack={noop}
            onSubmit={noop}
            onToggleDisplayFormat={noop}
            onCopySecret={noop}
            onCopyBackupCodes={noop}
            onDownloadBackupCodes={noop}
            onPrintBackupCodes={noop}
            onFinish={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
      {snapshot.flow === 'remove-mfa' ? (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileMfaRemoveDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onRemove={noop}
          />
          {verification}
        </AlertDialog>
      ) : null}
      {snapshot.flow === 'backup-codes' ? (
        <FlowCardDialog
          size='card'
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileBackupCodesDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onRetry={noop}
            onCopyAndClose={() => setOpen(false)}
            onDownload={noop}
            onPrint={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
      {snapshot.flow === 'delete-account' ? (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileDeleteAccountDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onConfirmationChange={noop}
            onDelete={noop}
          />
          {verification}
        </AlertDialog>
      ) : null}
      {snapshot.flow === 'sign-out-all-devices' ? (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileSignOutAllDevicesDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onSignOut={noop}
          />
          {verification}
        </AlertDialog>
      ) : null}
      {snapshot.flow === 'device' ? (
        <FlowCardDialog
          size='card'
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfileDeviceDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onSignOut={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
    </div>
  );
}
