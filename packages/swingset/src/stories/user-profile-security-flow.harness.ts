import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';

import { useActiveDevicesSectionFlow } from './user-profile-active-devices-section-flow.harness';
import { useDeleteSectionFlow } from './user-profile-delete-section-flow.harness';
import { useMfaSectionFlow } from './user-profile-mfa-section-flow.harness';
import { usePasskeysSectionFlow } from './user-profile-passkeys-section-flow.harness';
import { usePasswordSectionFlow } from './user-profile-password-section-flow.harness';
import { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-flow.config';

export { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-flow.config';

export function useSecurityFlow({
  config = DEFAULT_SECURITY_FLOW_CONFIG,
  initialDevices,
  onHasPasswordChange,
  onHasPasskeyChange,
  onMfaMethodChange,
  onBackupCodesChange,
}: {
  config?: SecurityFlowConfig;
  initialDevices: UserProfileDevice[];
  onHasPasswordChange?: (hasPassword: boolean) => void;
  onHasPasskeyChange?: (hasPasskey: boolean) => void;
  onMfaMethodChange?: Parameters<typeof useMfaSectionFlow>[0]['onMfaMethodChange'];
  onBackupCodesChange?: (enabled: boolean) => void;
}) {
  const activeDevices = useActiveDevicesSectionFlow({ config, initialDevices });
  const password = usePasswordSectionFlow({
    config,
    onHasPasswordChange,
    onSignOutOtherSessions: activeDevices.signOutOtherSessions,
  });
  const passkeys = usePasskeysSectionFlow({ config, onHasPasskeyChange });
  const mfa = useMfaSectionFlow({ config, onMfaMethodChange, onBackupCodesChange });
  const deletion = useDeleteSectionFlow({ config });

  const activeReverificationFlow = password.reverification
    ? password
    : passkeys.reverification
      ? passkeys
      : mfa.reverification
        ? mfa
        : activeDevices.reverification
          ? activeDevices
          : deletion;

  return {
    config,
    hasPassword: password.hasPassword,
    passkeys: passkeys.passkeys,
    mfaMethods: mfa.mfaMethods,
    devices: activeDevices.devices,
    password: password.password,
    addPasskey: passkeys.addPasskey,
    renamePasskey: passkeys.renamePasskey,
    removePasskey: passkeys.removePasskey,
    addMfa: mfa.addMfa,
    removeMfa: mfa.removeMfa,
    backupCodes: mfa.backupCodes,
    deleteAccount: deletion.deleteAccount,
    device: activeDevices.device,
    signOutAllDevices: activeDevices.signOutAllDevices,
    reverification:
      password.reverification ??
      passkeys.reverification ??
      mfa.reverification ??
      activeDevices.reverification ??
      deletion.reverification,
    openPassword: password.openPassword,
    closePassword: password.closePassword,
    updatePasswordValue: password.updatePasswordValue,
    submitPassword: password.submitPassword,
    openAddPasskey: passkeys.openAddPasskey,
    closeAddPasskey: passkeys.closeAddPasskey,
    submitAddPasskey: passkeys.submitAddPasskey,
    openRenamePasskey: passkeys.openRenamePasskey,
    closeRenamePasskey: passkeys.closeRenamePasskey,
    updatePasskeyName: passkeys.updatePasskeyName,
    submitRenamePasskey: passkeys.submitRenamePasskey,
    openRemovePasskey: passkeys.openRemovePasskey,
    closeRemovePasskey: passkeys.closeRemovePasskey,
    submitRemovePasskey: passkeys.submitRemovePasskey,
    openAddMfa: mfa.openAddMfa,
    closeAddMfa: mfa.closeAddMfa,
    addNewMfaPhone: mfa.addNewMfaPhone,
    selectMfaPhone: mfa.selectMfaPhone,
    updateMfaPhoneNumber: mfa.updateMfaPhoneNumber,
    updateMfaCode: mfa.updateMfaCode,
    toggleMfaDisplayFormat: mfa.toggleMfaDisplayFormat,
    submitAddMfa: mfa.submitAddMfa,
    finishAddMfa: mfa.finishAddMfa,
    markMfaBackupCodesCopied: mfa.markMfaBackupCodesCopied,
    resendMfaCode: mfa.resendMfaCode,
    openRemoveMfa: mfa.openRemoveMfa,
    closeRemoveMfa: mfa.closeRemoveMfa,
    submitRemoveMfa: mfa.submitRemoveMfa,
    openBackupCodes: mfa.openBackupCodes,
    closeBackupCodes: mfa.closeBackupCodes,
    regenerateBackupCodes: mfa.regenerateBackupCodes,
    markBackupCodesCopied: mfa.markBackupCodesCopied,
    openDeleteAccount: deletion.openDeleteAccount,
    closeDeleteAccount: deletion.closeDeleteAccount,
    updateDeleteConfirmation: deletion.updateDeleteConfirmation,
    submitDeleteAccount: deletion.submitDeleteAccount,
    openDevice: activeDevices.openDevice,
    closeDevice: activeDevices.closeDevice,
    requestSignOutDevice: activeDevices.requestSignOutDevice,
    cancelSignOutDevice: activeDevices.cancelSignOutDevice,
    submitSignOutDevice: activeDevices.submitSignOutDevice,
    openSignOutAllDevices: activeDevices.openSignOutAllDevices,
    closeSignOutAllDevices: activeDevices.closeSignOutAllDevices,
    submitSignOutAllDevices: activeDevices.submitSignOutAllDevices,
    updateVerificationValue: activeReverificationFlow.updateVerificationValue,
    submitVerification: activeReverificationFlow.submitVerification,
    resendReverification: activeReverificationFlow.resendReverification,
    cancelReverification: activeReverificationFlow.cancelReverification,
  };
}
