import { Freeze } from '@clerk/headless/utils';
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type {
  ReverificationChallengeState,
  UserProfileBackupCodesFlowState,
  UserProfileDeleteAccountFlowState,
  UserProfileDeviceDetailsFlowState,
  UserProfileMfaAddFlowState,
  UserProfileMfaRemoveFlowState,
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
  UserProfilePasswordFlowState,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { ReverificationDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/reverification-dialog.view';
import { UserProfileBackupCodesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-backup-codes-dialog.view';
import { UserProfileDeleteAccountDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-account-dialog.view';
import {
  UserProfileDeviceDialogView,
  UserProfileDeviceSignOutDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import {
  UserProfileMfaAddDialogView,
  UserProfileMfaRemoveDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-mfa-dialog.view';
import {
  UserProfilePasskeyAddDialogView,
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-passkey-dialog.view';
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

function SecurityFlowDialogs({ flow }: { flow: ReturnType<typeof useSecurityFlow> }) {
  const verificationDialog = (
    operation:
      | 'password'
      | 'add-passkey'
      | 'rename-passkey'
      | 'remove-passkey'
      | 'add-mfa'
      | 'remove-mfa'
      | 'backup-codes'
      | 'delete-account'
      | 'sign-out-device'
      | 'sign-out-all-devices',
  ) => {
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
          if (!open) {
            flow.closePassword();
          }
        }}
      >
        <Freeze frozen={!flow.password}>
          {flow.password ? (
            <UserProfilePasswordDialogView
              state={flow.password}
              canSubmit={
                Boolean(flow.password.values.newPassword) &&
                flow.password.values.newPassword === flow.password.values.confirmPassword
              }
              isInterrupted={flow.reverification?.operation === 'password'}
              onCancel={flow.closePassword}
              onValueChange={flow.updatePasswordValue}
              onSubmit={flow.submitPassword}
            />
          ) : null}
        </Freeze>
        {verificationDialog('password')}
      </FlowCardDialog>
      <FlowCardDialog
        finalFocus={flow.passkeysTriggerRef}
        open={Boolean(flow.addPasskey)}
        onOpenChange={open => {
          if (!open) {
            flow.closeAddPasskey();
          }
        }}
      >
        <Freeze frozen={!flow.addPasskey}>
          {flow.addPasskey ? (
            <UserProfilePasskeyAddDialogView
              state={flow.addPasskey}
              isInterrupted={flow.reverification?.operation === 'add-passkey'}
              onAdd={flow.submitAddPasskey}
              onCancel={flow.closeAddPasskey}
            />
          ) : null}
        </Freeze>
        {verificationDialog('add-passkey')}
      </FlowCardDialog>
      <FlowCardDialog
        finalFocus={flow.passkeysTriggerRef}
        open={Boolean(flow.renamePasskey)}
        onOpenChange={open => {
          if (!open) {
            flow.closeRenamePasskey();
          }
        }}
      >
        <Freeze frozen={!flow.renamePasskey}>
          {flow.renamePasskey ? (
            <UserProfilePasskeyRenameDialogView
              state={flow.renamePasskey}
              isInterrupted={flow.reverification?.operation === 'rename-passkey'}
              onCancel={flow.closeRenamePasskey}
              onNameChange={flow.updatePasskeyName}
              onRename={flow.submitRenamePasskey}
            />
          ) : null}
        </Freeze>
        {verificationDialog('rename-passkey')}
      </FlowCardDialog>
      <AlertDialog
        finalFocus={flow.passkeysTriggerRef}
        open={Boolean(flow.removePasskey)}
        onOpenChange={open => {
          if (!open) {
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
          if (!open) {
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
              onSubmit={code => void flow.submitAddMfa(code)}
              onToggleDisplayFormat={flow.toggleMfaDisplayFormat}
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
          if (!open) {
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
          if (!open) {
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
              onCopy={() => {
                if (flow.backupCodes?.step === 'codes') {
                  void navigator.clipboard?.writeText(flow.backupCodes.codes.join('\n'));
                  flow.markBackupCodesCopied();
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
          if (!open) {
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
          if (!open) {
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
          if (!open) {
            flow.closeDevice();
          }
        }}
      >
        <Freeze frozen={!flow.device}>
          {flow.device ? (
            <UserProfileDeviceDialogView
              state={flow.device}
              isInterrupted={flow.device.step === 'confirm'}
              onRequestSignOut={flow.requestSignOutDevice}
            />
          ) : null}
        </Freeze>
        <AlertDialog
          open={flow.device?.step === 'confirm'}
          onOpenChange={open => {
            if (!open) {
              flow.cancelSignOutDevice();
            }
          }}
        >
          <Freeze frozen={flow.device?.step !== 'confirm'}>
            {flow.device?.step === 'confirm' ? (
              <UserProfileDeviceSignOutDialogView
                state={flow.device}
                isInterrupted={flow.reverification?.operation === 'sign-out-device'}
                onCancel={flow.cancelSignOutDevice}
                onSignOut={flow.submitSignOutDevice}
              />
            ) : null}
          </Freeze>
          {verificationDialog('sign-out-device')}
        </AlertDialog>
      </FlowCardDialog>
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
      closedBy='closerequest'
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
  const flow = useSecurityFlow({
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
        mfaMethods={flow.mfaMethods}
        mfaAddableMethods={[
          ...(config.mfaPhoneAvailable ? (['sms'] as const) : []),
          ...(config.mfaAuthenticatorAvailable ? (['authenticator'] as const) : []),
        ]}
        passkeys={config.passkeysAvailable ? flow.passkeys : undefined}
        passwordAvailable={config.passwordAvailable}
        onAddPasskey={config.passkeysAvailable && config.passkeyCreationAvailable ? flow.openAddPasskey : undefined}
        onChangePassword={config.passwordAvailable ? flow.openPassword : undefined}
        onAddMfaMethod={config.mfaPhoneAvailable || config.mfaAuthenticatorAvailable ? flow.openAddMfa : undefined}
        onDeleteAccount={config.deleteAccountAvailable ? flow.openDeleteAccount : undefined}
        onManageDevice={flow.openDevice}
        onManagePasskey={flow.openRenamePasskey}
        onRemoveMfaMethod={flow.openRemoveMfa}
        onRegenerateBackupCodes={flow.openBackupCodes}
        onRemovePasskey={flow.openRemovePasskey}
        onSignOutAllOtherDevices={flow.openSignOutAllDevices}
        onSignOutDevice={flow.openDevice}
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
  | ({ flow: 'add-passkey' } & Snapshot<UserProfilePasskeyAddFlowState>)
  | ({ flow: 'rename-passkey' } & Snapshot<UserProfilePasskeyRenameFlowState>)
  | ({ flow: 'remove-passkey' } & Snapshot<UserProfilePasskeyRemoveFlowState>)
  | ({ flow: 'add-mfa' } & Snapshot<UserProfileMfaAddFlowState>)
  | ({ flow: 'remove-mfa' } & Snapshot<UserProfileMfaRemoveFlowState>)
  | ({ flow: 'backup-codes' } & Snapshot<UserProfileBackupCodesFlowState>)
  | ({ flow: 'delete-account' } & Snapshot<UserProfileDeleteAccountFlowState>)
  | ({ flow: 'device' } & Snapshot<UserProfileDeviceDetailsFlowState>)
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
const deviceDetails: UserProfileDeviceDetailsFlowState['device'] = {
  id: 'desktop',
  title: 'Macbook Pro · Chrome',
  lastActiveAtLabel: 'Last active 4 days ago',
  deviceName: 'Macbook Pro',
  browserName: 'Chrome 150.0.0.0',
  ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
  location: 'Salt Lake City, UT, United States',
  locationFlag: '🇺🇸',
  originalSignInAtLabel: 'July 5th, 2026',
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
    variant: 'enterprise managed',
    state: {
      mode: 'change',
      values: { ...passwordValues, newPassword: '', confirmPassword: '' },
      isReadOnly: true,
      isSubmitting: false,
      errors: {},
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
    flow: 'add-passkey',
    step: 'add passkey',
    variant: 'idle',
    state: { isSubmitting: false, errors: {} },
  },
  {
    flow: 'add-passkey',
    step: 'add passkey',
    variant: 'submitting',
    state: { isSubmitting: true, errors: {} },
  },
  {
    flow: 'add-passkey',
    step: 'add passkey',
    variant: 'server error',
    state: { isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } },
  },
  {
    flow: 'add-passkey',
    step: 'add passkey',
    variant: 'reverification',
    state: { isSubmitting: true, errors: {} },
    reverification: idleVerification,
  },
  {
    flow: 'rename-passkey',
    step: 'rename passkey',
    variant: 'unchanged',
    state: {
      id: 'passkey',
      originalName: 'Passkey',
      name: 'Passkey',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'rename-passkey',
    step: 'rename passkey',
    variant: 'ready',
    state: {
      id: 'passkey',
      originalName: 'Passkey',
      name: 'Chrome on macOS',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'rename-passkey',
    step: 'rename passkey',
    variant: 'submitting',
    state: {
      id: 'passkey',
      originalName: 'Passkey',
      name: 'Chrome on macOS',
      isSubmitting: true,
      errors: {},
    },
  },
  {
    flow: 'rename-passkey',
    step: 'rename passkey',
    variant: 'server error',
    state: {
      id: 'passkey',
      originalName: 'Passkey',
      name: 'Chrome on macOS',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'remove-passkey',
    step: 'remove passkey',
    variant: 'idle',
    state: { id: 'passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} },
  },
  {
    flow: 'remove-passkey',
    step: 'remove passkey',
    variant: 'submitting',
    state: { id: 'passkey', name: 'Chrome on macOS', isSubmitting: true, errors: {} },
  },
  {
    flow: 'remove-passkey',
    step: 'remove passkey',
    variant: 'server error',
    state: {
      id: 'passkey',
      name: 'Chrome on macOS',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'add-mfa',
    step: 'choose phone',
    variant: 'existing numbers',
    state: {
      method: 'sms',
      step: 'select-phone',
      phones: [
        { id: 'verified', label: '+1 801-888-8181', isVerified: true },
        { id: 'unverified', label: '+1 801-555-0100', isVerified: false },
      ],
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'choose phone',
    variant: 'enabling existing',
    state: {
      method: 'sms',
      step: 'select-phone',
      phones: [{ id: 'verified', label: '+1 801-888-8181', isVerified: true }],
      loadingPhoneId: 'verified',
      isSubmitting: true,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'add phone',
    variant: 'phone number',
    state: { method: 'sms', step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} },
  },
  {
    flow: 'add-mfa',
    step: 'add phone',
    variant: 'submitting',
    state: { method: 'sms', step: 'phone', phoneNumber: '+1 801 555 0100', isSubmitting: true, errors: {} },
  },
  {
    flow: 'add-mfa',
    step: 'verify phone',
    variant: 'code',
    state: {
      method: 'sms',
      step: 'verify',
      identifier: '+1 801 555 0100',
      code: '',
      status: 'idle',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify phone',
    variant: 'verifying',
    state: {
      method: 'sms',
      step: 'verify',
      identifier: '+1 801 555 0100',
      code: '424242',
      status: 'verifying',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: true,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify phone',
    variant: 'wrong code',
    state: {
      method: 'sms',
      step: 'verify',
      identifier: '+1 801 555 0100',
      code: '',
      status: 'error',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: false,
      errors: { field: 'Incorrect code. Please try again.' },
    },
  },
  {
    flow: 'add-mfa',
    step: 'add authenticator',
    variant: 'preparing',
    state: { method: 'authenticator', step: 'preparing', isSubmitting: true, errors: {} },
  },
  {
    flow: 'add-mfa',
    step: 'add authenticator',
    variant: 'preparation error',
    state: {
      method: 'authenticator',
      step: 'preparing',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'add-mfa',
    step: 'add authenticator',
    variant: 'QR code',
    state: {
      method: 'authenticator',
      step: 'setup',
      displayFormat: 'qr',
      secret: 'JBSWY3DPEHPK3PXP',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'add authenticator',
    variant: 'setup key',
    state: {
      method: 'authenticator',
      step: 'setup',
      displayFormat: 'key',
      secret: 'JBSWY3DPEHPK3PXP',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify authenticator',
    variant: 'code',
    state: {
      method: 'authenticator',
      step: 'verify',
      code: '',
      status: 'idle',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify authenticator',
    variant: 'wrong code',
    state: {
      method: 'authenticator',
      step: 'verify',
      code: '',
      status: 'error',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: false,
      errors: { field: 'Incorrect code. Please try again.' },
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify authenticator',
    variant: 'server error',
    state: {
      method: 'authenticator',
      step: 'verify',
      code: '424242',
      status: 'error',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'add-mfa',
    step: 'verify phone',
    variant: 'reverification',
    state: {
      method: 'sms',
      step: 'verify',
      identifier: '+1 801 555 0100',
      code: '424242',
      status: 'verifying',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: true,
      errors: {},
    },
    reverification: idleVerification,
  },
  {
    flow: 'add-mfa',
    step: 'backup codes after enrollment',
    variant: 'ready',
    state: {
      method: 'authenticator',
      step: 'backup-codes',
      codes: ['3k4p-7m2q', '9w6d-2x8n', '5t1r-8c4v', '7j3f-6h9s', '2b8m-4q1k', '6n5x-9p3d'],
      copied: false,
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'add-mfa',
    step: 'add authenticator',
    variant: 'success without backup codes',
    state: { method: 'authenticator', step: 'success', isSubmitting: false, errors: {} },
  },
  {
    flow: 'remove-mfa',
    step: 'remove method',
    variant: 'phone number',
    state: {
      method: 'sms',
      id: 'sms',
      label: '+1 801-888-8181',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'remove-mfa',
    step: 'remove method',
    variant: 'submitting',
    state: {
      method: 'authenticator',
      id: 'authenticator',
      label: 'Authenticator app',
      isSubmitting: true,
      errors: {},
    },
  },
  {
    flow: 'remove-mfa',
    step: 'remove method',
    variant: 'authenticator',
    state: {
      method: 'authenticator',
      id: 'authenticator',
      label: 'Authenticator app',
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'remove-mfa',
    step: 'remove method',
    variant: 'server error',
    state: {
      method: 'authenticator',
      id: 'authenticator',
      label: 'Authenticator app',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'backup-codes',
    step: 'backup codes',
    variant: 'generating',
    state: { step: 'generating', isSubmitting: true, errors: {} },
  },
  {
    flow: 'backup-codes',
    step: 'backup codes',
    variant: 'server error',
    state: {
      step: 'generating',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'backup-codes',
    step: 'backup codes',
    variant: 'reverification',
    state: { step: 'generating', isSubmitting: true, errors: {} },
    reverification: idleVerification,
  },
  {
    flow: 'backup-codes',
    step: 'new codes',
    variant: 'ready',
    state: {
      step: 'codes',
      codes: ['3k4p-7m2q', '9w6d-2x8n', '5t1r-8c4v', '7j3f-6h9s', '2b8m-4q1k', '6n5x-9p3d'],
      copied: false,
      isSubmitting: false,
      errors: {},
    },
  },
  {
    flow: 'backup-codes',
    step: 'new codes',
    variant: 'copied',
    state: {
      step: 'codes',
      codes: ['3k4p-7m2q', '9w6d-2x8n', '5t1r-8c4v', '7j3f-6h9s', '2b8m-4q1k', '6n5x-9p3d'],
      copied: true,
      isSubmitting: false,
      errors: {},
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
    flow: 'device',
    step: 'device',
    variant: 'details',
    state: { step: 'details', device: deviceDetails, isSubmitting: false, errors: {} },
  },
  {
    flow: 'device',
    step: 'device',
    variant: 'confirm',
    state: { step: 'confirm', device: deviceDetails, isSubmitting: false, errors: {} },
  },
  {
    flow: 'device',
    step: 'device',
    variant: 'submitting',
    state: { step: 'confirm', device: deviceDetails, isSubmitting: true, errors: {} },
  },
  {
    flow: 'device',
    step: 'device',
    variant: 'server error',
    state: {
      device: deviceDetails,
      step: 'confirm',
      isSubmitting: false,
      errors: { form: 'Something went wrong. Please try again.' },
    },
  },
  {
    flow: 'device',
    step: 'device',
    variant: 'reverification',
    state: { step: 'confirm', device: deviceDetails, isSubmitting: true, errors: {} },
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
        <FlowCardDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfilePasswordDialogView
            state={snapshot.state}
            canSubmit={Boolean(snapshot.state.values.newPassword)}
            isInterrupted={verificationOpen}
            onCancel={() => setOpen(false)}
            onValueChange={noop}
            onSubmit={noop}
          />
          {verification}
        </FlowCardDialog>
      ) : null}
      {snapshot.flow === 'add-passkey' ? (
        <FlowCardDialog
          open={open}
          onOpenChange={setOpen}
        >
          <UserProfilePasskeyAddDialogView
            state={snapshot.state}
            isInterrupted={verificationOpen}
            onAdd={noop}
            onCancel={() => setOpen(false)}
          />
          {verification}
        </FlowCardDialog>
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
            onSubmit={noop}
            onToggleDisplayFormat={noop}
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
            onCopy={noop}
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
            isInterrupted={snapshot.state.step === 'confirm'}
            onRequestSignOut={noop}
          />
          <AlertDialog open={snapshot.state.step === 'confirm'}>
            <UserProfileDeviceSignOutDialogView
              state={snapshot.state}
              isInterrupted={verificationOpen}
              onCancel={noop}
              onSignOut={noop}
            />
            {verification}
          </AlertDialog>
        </FlowCardDialog>
      ) : null}
    </div>
  );
}
