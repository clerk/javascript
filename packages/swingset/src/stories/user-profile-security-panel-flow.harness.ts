import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';

import { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import { useDeleteFlowSlice } from './user-profile-security-panel-flow.delete';
import { useDevicesFlowSlice } from './user-profile-security-panel-flow.devices';
import { useMfaFlowSlice } from './user-profile-security-panel-flow.mfa';
import { usePasskeysFlowSlice } from './user-profile-security-panel-flow.passkeys';
import { usePasswordFlowSlice } from './user-profile-security-panel-flow.password';
import { useSecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

export { DEFAULT_SECURITY_FLOW_CONFIG, type SecurityFlowConfig } from './user-profile-security-panel-flow.config';

export interface UserProfileSecurityPanelFlowOptions {
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
}

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
}: UserProfileSecurityPanelFlowOptions) {
  const reverificationFlow = useSecurityReverificationFlow(config);
  const activeDevices = useDevicesFlowSlice({ config, reverificationFlow, initialDevices });
  const password = usePasswordFlowSlice({
    config,
    reverificationFlow,
    onHasPasswordChange,
    onSignOutOtherSessions: activeDevices.signOutOtherSessions,
  });
  const passkeys = usePasskeysFlowSlice({ config, reverificationFlow, onHasPasskeyChange });
  const mfa = useMfaFlowSlice({ config, reverificationFlow, onMfaMethodChange, onBackupCodesChange });
  const deletion = useDeleteFlowSlice({
    config,
    reverificationFlow,
    otherSessionsCount,
    afterSignOutUrl,
    afterMultiSessionSingleSignOutUrl,
    onSetActive,
  });

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
    passkeyCreation: passkeys.passkeyCreation,
    renamePasskey: passkeys.renamePasskey,
    removePasskey: passkeys.removePasskey,
    addMfa: mfa.addMfa,
    removeMfa: mfa.removeMfa,
    backupCodes: mfa.backupCodes,
    deleteAccount: deletion.deleteAccount,
    device: activeDevices.device,
    deviceSignOut: activeDevices.deviceSignOut,
    signOutAllDevices: activeDevices.signOutAllDevices,
    reverification: reverificationFlow.reverification,
    openPassword: password.openPassword,
    closePassword: password.closePassword,
    updatePasswordValue: password.updatePasswordValue,
    submitPassword: password.submitPassword,
    addPasskey: passkeys.addPasskey,
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
    openDeleteAccount: deletion.openDeleteAccount,
    closeDeleteAccount: deletion.closeDeleteAccount,
    updateDeleteConfirmation: deletion.updateDeleteConfirmation,
    submitDeleteAccount: deletion.submitDeleteAccount,
    openDevice: activeDevices.openDevice,
    signOutDevice: activeDevices.signOutDevice,
    closeDevice: activeDevices.closeDevice,
    openSignOutAllDevices: activeDevices.openSignOutAllDevices,
    closeSignOutAllDevices: activeDevices.closeSignOutAllDevices,
    submitSignOutAllDevices: activeDevices.submitSignOutAllDevices,
    updateVerificationValue: reverificationFlow.updateVerificationValue,
    submitVerification: reverificationFlow.submitVerification,
    resendReverification: reverificationFlow.resendReverification,
    cancelReverification: reverificationFlow.cancelReverification,
  };
}
