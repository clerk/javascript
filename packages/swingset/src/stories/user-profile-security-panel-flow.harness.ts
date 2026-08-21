import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';

import { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import { useDeleteFlowSlice } from './user-profile-security-panel-flow.delete';
import { useDevicesFlowSlice } from './user-profile-security-panel-flow.devices';
import { useMfaFlowSlice } from './user-profile-security-panel-flow.mfa';
import { usePasskeysFlowSlice } from './user-profile-security-panel-flow.passkeys';
import { usePasswordFlowSlice } from './user-profile-security-panel-flow.password';

export { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-panel-flow.config';

export function useUserProfileSecurityPanelFlow({
  config = DEFAULT_SECURITY_FLOW_CONFIG,
  initialDevices,
  onHasPasswordChange,
  onHasPasskeyChange,
  onMfaMethodChange,
  onBackupCodesChange,
  otherSessionsCount,
  afterSignOutUrl,
  afterMultiSessionSingleSignOutUrl,
  onSetActive,
}: {
  config?: SecurityFlowConfig;
  initialDevices: UserProfileDevice[];
  onHasPasswordChange?: (hasPassword: boolean) => void;
  onHasPasskeyChange?: (hasPasskey: boolean) => void;
  onMfaMethodChange?: Parameters<typeof useMfaFlowSlice>[0]['onMfaMethodChange'];
  onBackupCodesChange?: (enabled: boolean) => void;
  otherSessionsCount?: number;
  afterSignOutUrl?: string;
  afterMultiSessionSingleSignOutUrl?: string;
  onSetActive?: (result: { session: null; redirectUrl: string }) => void;
}) {
  const activeDevices = useDevicesFlowSlice({ config, initialDevices });
  const password = usePasswordFlowSlice({
    config,
    onHasPasswordChange,
    onSignOutOtherSessions: activeDevices.signOutOtherSessions,
  });
  const passkeys = usePasskeysFlowSlice({ config, onHasPasskeyChange });
  const mfa = useMfaFlowSlice({ config, onMfaMethodChange, onBackupCodesChange });
  const deletion = useDeleteFlowSlice({
    config,
    otherSessionsCount,
    afterSignOutUrl,
    afterMultiSessionSingleSignOutUrl,
    onSetActive,
  });

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
    passwordTriggerRef: password.triggerRef,
    passkeysTriggerRef: passkeys.triggerRef,
    mfaTriggerRef: mfa.triggerRef,
    deleteTriggerRef: deletion.triggerRef,
    activeDevicesTriggerRef: activeDevices.triggerRef,
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
    copyMfaSecret: mfa.copyMfaSecret,
    backAddMfa: mfa.backAddMfa,
    submitAddMfa: mfa.submitAddMfa,
    finishAddMfa: mfa.finishAddMfa,
    markMfaBackupCodesCopied: mfa.markMfaBackupCodesCopied,
    resendMfaCode: mfa.resendMfaCode,
    openRemoveMfa: mfa.openRemoveMfa,
    closeRemoveMfa: mfa.closeRemoveMfa,
    submitRemoveMfa: mfa.submitRemoveMfa,
    openBackupCodes: mfa.openBackupCodes,
    setDefaultMfa: mfa.setDefaultMfa,
    closeBackupCodes: mfa.closeBackupCodes,
    regenerateBackupCodes: mfa.regenerateBackupCodes,
    markBackupCodesCopied: mfa.markBackupCodesCopied,
    openDeleteAccount: deletion.openDeleteAccount,
    closeDeleteAccount: deletion.closeDeleteAccount,
    updateDeleteConfirmation: deletion.updateDeleteConfirmation,
    submitDeleteAccount: deletion.submitDeleteAccount,
    openDevice: activeDevices.openDevice,
    openSignOutDevice: activeDevices.openSignOutDevice,
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
