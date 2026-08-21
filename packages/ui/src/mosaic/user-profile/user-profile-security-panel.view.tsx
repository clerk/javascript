import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import type {
  UserProfileDeviceSignOutFlowState,
  UserProfilePasskeyCreationState,
  UserProfileSecurityPanelFlows,
} from './dialogs/flow.types';
import { SecurityPanelDialogsView } from './dialogs/security-panel-dialogs.view';
import type {
  UserProfileActiveDevicesSectionViewProps,
  UserProfileDevice,
} from './user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';
import { UserProfileDeleteSectionView } from './user-profile-delete-section.view';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from './user-profile-mfa-section.view';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from './user-profile-passkeys-section.view';
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';
import { userProfileSecurityBase as m } from './user-profile-security.messages';
import { styles } from './user-profile-security-panel.styles';

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

export interface UserProfileSecurityPanelViewProps
  extends Omit<UserProfileActiveDevicesSectionViewProps, 'devices' | 'signOutState'>, UserProfileSecurityPanelFlows {
  hasPassword?: boolean;
  /** Whether this instance allows the user to set a password. Defaults to `hasPassword`. */
  passwordAvailable?: boolean;
  passkeys?: UserProfilePasskey[];
  passkeyCreationState?: UserProfilePasskeyCreationState | null;
  deviceSignOutState?: UserProfileDeviceSignOutFlowState | null;
  mfaMethods?: UserProfileMfaMethod[];
  mfaAddableMethods?: UserProfileMfaAddableMethod[];
  devices?: UserProfileDevice[];
  devicesStatus?: 'loading' | 'ready' | 'error';
  devicesError?: string;
  onChangePassword?: () => void;
  onAddPasskey?: () => void;
  onManagePasskey?: (id: string) => void;
  onRemovePasskey?: (id: string) => void;
  onAddMfaMethod?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onEnableBackupCodes?: () => void;
  onSetDefaultMfaMethod?: (id: string) => void;
  onRemoveMfaMethod?: (id: string) => void;
  onDeleteAccount?: () => void;
}

export function UserProfileSecurityPanelView({
  passwordTriggerRef,
  passkeysTriggerRef,
  mfaTriggerRef,
  deleteTriggerRef,
  activeDevicesTriggerRef,
  password,
  renamePasskey,
  removePasskey,
  addMfa,
  removeMfa,
  backupCodes,
  deleteAccount,
  device,
  signOutAllDevices,
  reverification,
  hasPassword = false,
  passwordAvailable = hasPassword,
  passkeys,
  passkeyCreationState,
  deviceSignOutState,
  mfaMethods,
  mfaAddableMethods,
  devices,
  devicesStatus,
  devicesError,
  onChangePassword,
  onAddPasskey,
  onManagePasskey,
  onRemovePasskey,
  onAddMfaMethod,
  onRegenerateBackupCodes,
  onEnableBackupCodes,
  onSetDefaultMfaMethod,
  onRemoveMfaMethod,
  onManageDevice,
  onSignOutDevice,
  onSignOutAllOtherDevices,
  onDeleteAccount,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const hasAuthentication = passwordAvailable || passkeys !== undefined || mfaMethods !== undefined;

  return (
    <div {...mergeStyleProps(themeProps('user-profile-security-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        {m.sections.security}
      </Heading>
      <div {...stylex.props(styles.sections)}>
        {hasAuthentication ? (
          <div {...stylex.props(styles.sectionCards)}>
            {passwordAvailable ? (
              <UserProfilePasswordSectionView
                hasPassword={hasPassword}
                onChangePassword={onChangePassword}
              />
            ) : null}
            {passkeys !== undefined ? (
              <UserProfilePasskeysSectionView
                passkeys={passkeys}
                creationState={passkeyCreationState}
                sectionTitle={passwordAvailable ? undefined : m.sections.authentication}
                onAdd={onAddPasskey}
                onManage={onManagePasskey}
                onRemove={onRemovePasskey}
              />
            ) : null}
            {mfaMethods !== undefined ? (
              <UserProfileMfaSectionView
                methods={mfaMethods}
                addableMethods={mfaAddableMethods}
                sectionTitle={!passwordAvailable && passkeys === undefined ? m.sections.authentication : undefined}
                onAdd={onAddMfaMethod}
                onRegenerateBackupCodes={onRegenerateBackupCodes}
                onEnableBackupCodes={onEnableBackupCodes}
                onRemove={onRemoveMfaMethod}
                onSetDefault={onSetDefaultMfaMethod}
              />
            ) : null}
          </div>
        ) : null}
        {devices ? (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            signOutState={deviceSignOutState}
            status={devicesStatus}
            error={devicesError}
            onManageDevice={onManageDevice}
            onSignOutAllOtherDevices={onSignOutAllOtherDevices}
            onSignOutDevice={onSignOutDevice}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </div>
      <SecurityPanelDialogsView
        activeDevicesTriggerRef={activeDevicesTriggerRef}
        addMfa={addMfa}
        backupCodes={backupCodes}
        deleteAccount={deleteAccount}
        deleteTriggerRef={deleteTriggerRef}
        device={device}
        mfaTriggerRef={mfaTriggerRef}
        passkeysTriggerRef={passkeysTriggerRef}
        password={password}
        passwordTriggerRef={passwordTriggerRef}
        removeMfa={removeMfa}
        removePasskey={removePasskey}
        renamePasskey={renamePasskey}
        reverification={reverification}
        signOutAllDevices={signOutAllDevices}
      />
    </div>
  );
}
