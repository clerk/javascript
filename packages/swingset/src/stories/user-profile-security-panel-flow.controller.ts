import type { UserProfileSecurityPanelFlows } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type {
  UserProfileDevice,
  UserProfileSecurityPanelViewProps,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';

import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-panel-flow.config';
import type { UserProfileSecurityPanelFlowOptions } from './user-profile-security-panel-flow.harness';
import { useUserProfileSecurityPanelFlow } from './user-profile-security-panel-flow.harness';

export const SECURITY_FLOW_DEVICES: UserProfileDevice[] = [
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

interface SecurityPanelStoryEffects {
  copyText?: (value: string) => void | Promise<unknown>;
  downloadBackupCodes?: (codes: string[]) => void;
  print?: () => void;
}

export type UserProfileSecurityPanelMockControllerOptions = Omit<
  UserProfileSecurityPanelFlowOptions,
  'initialDevices'
> & {
  initialDevices?: UserProfileDevice[];
  effects?: SecurityPanelStoryEffects;
};

export type UserProfileSecurityPanelMockController = UserProfileSecurityPanelViewProps;

function downloadBackupCodes(codes: string[]) {
  const url = URL.createObjectURL(new Blob([codes.join('\n')], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clerk-backup-codes.txt';
  link.click();
  URL.revokeObjectURL(url);
}

export function useUserProfileSecurityPanelMockController({
  config = DEFAULT_SECURITY_FLOW_CONFIG,
  initialDevices = SECURITY_FLOW_DEVICES,
  effects,
  ...options
}: UserProfileSecurityPanelMockControllerOptions = {}): UserProfileSecurityPanelMockController {
  const flow = useUserProfileSecurityPanelFlow({
    config,
    initialDevices,
    otherSessionsCount: options.otherSessionsCount ?? config.otherSessionsCount,
    ...options,
  });
  const copyText = effects?.copyText ?? (value => navigator.clipboard?.writeText(value));
  const download = effects?.downloadBackupCodes ?? downloadBackupCodes;
  const print = effects?.print ?? (() => window.print());
  const addableMfaMethods = [
    ...(config.mfaPhoneAvailable ? (['sms'] as const) : []),
    ...(config.mfaAuthenticatorAvailable ? (['authenticator'] as const) : []),
  ];

  const dialogs: UserProfileSecurityPanelFlows = {
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
              void copyText(flow.addMfa.codes.join('\n'));
              flow.markMfaBackupCodesCopied();
            }
          },
          onDownloadBackupCodes: () => {
            if (flow.addMfa?.step === 'backup-codes') {
              download(flow.addMfa.codes);
            }
          },
          onPrintBackupCodes: print,
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
              void copyText(flow.backupCodes.codes.join('\n'));
              flow.closeBackupCodes();
            }
          },
          onDownload: () => {
            if (flow.backupCodes?.step === 'codes') {
              download(flow.backupCodes.codes);
            }
          },
          onPrint: print,
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

  const password = {
    hasPassword: flow.hasPassword,
    onChangePassword: config.passwordAvailable ? flow.openPassword : undefined,
  };
  const passkeys = {
    passkeys: flow.passkeys,
    creationState: flow.passkeyCreation,
    onAdd: config.passkeyCreationAvailable ? flow.addPasskey : undefined,
    onManage: flow.openRenamePasskey,
    onRemove: flow.openRemovePasskey,
  };
  const mfa = {
    methods: flow.mfaMethods,
    addableMethods: addableMfaMethods,
    onAdd: config.mfaPhoneAvailable || config.mfaAuthenticatorAvailable ? flow.openAddMfa : undefined,
    onRegenerateBackupCodes: flow.openBackupCodes,
    onEnableBackupCodes: config.backupCodesAvailable ? flow.openBackupCodes : undefined,
    onSetDefault: flow.setDefaultMfa,
    onRemove: flow.openRemoveMfa,
  };
  const devices = {
    devices: config.devicesStatus === 'ready' ? flow.devices : [],
    status: config.devicesStatus,
    error: config.devicesStatus === 'error' ? 'Sessions are unavailable.' : undefined,
    signOutState: flow.deviceSignOut,
    onManageDevice: flow.openDevice,
    onSignOutDevice: flow.signOutDevice,
    onSignOutAllOtherDevices: flow.openSignOutAllDevices,
  };
  const deletion = { onDelete: flow.openDeleteAccount };

  return {
    ...dialogs,
    hasPassword: password.hasPassword,
    passwordAvailable: config.passwordAvailable,
    passkeys: config.passkeysAvailable ? passkeys.passkeys : undefined,
    passkeyCreationState: passkeys.creationState,
    mfaMethods:
      config.mfaPhoneAvailable || config.mfaAuthenticatorAvailable || config.backupCodesAvailable
        ? mfa.methods
        : undefined,
    mfaAddableMethods: mfa.addableMethods,
    devices: devices.devices,
    devicesStatus: devices.status,
    devicesError: devices.error,
    deviceSignOutState: devices.signOutState,
    onChangePassword: password.onChangePassword,
    onAddPasskey: config.passkeysAvailable ? passkeys.onAdd : undefined,
    onManagePasskey: passkeys.onManage,
    onRemovePasskey: passkeys.onRemove,
    onAddMfaMethod: mfa.onAdd,
    onRegenerateBackupCodes: mfa.onRegenerateBackupCodes,
    onEnableBackupCodes: mfa.onEnableBackupCodes,
    onSetDefaultMfaMethod: mfa.onSetDefault,
    onRemoveMfaMethod: mfa.onRemove,
    onManageDevice: devices.onManageDevice,
    onSignOutDevice: devices.onSignOutDevice,
    onSignOutAllOtherDevices: devices.onSignOutAllOtherDevices,
    onDeleteAccount: config.deleteAccountAvailable ? deletion.onDelete : undefined,
  };
}
