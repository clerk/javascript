import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';

import { Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
import type {
  UserProfileActiveDevicesSectionViewProps,
  UserProfileDevice,
} from './user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';
import { UserProfileDeleteSectionView } from './user-profile-delete-section/user-profile-delete-section.view';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from './user-profile-mfa-section.view';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from './user-profile-passkeys-section.view';
import type {
  UserProfileEditPasswordValue,
  UserProfilePasswordManagedBy,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section/user-profile-password-section.view';
import { UserProfilePasswordSectionView } from './user-profile-password-section/user-profile-password-section.view';
import { styles } from './user-profile-security-panel.styles';

export type {
  UserProfileDevice,
  UserProfileEditPasswordValue,
  UserProfileMfaAddableMethod,
  UserProfileMfaMethod,
  UserProfilePasskey,
  UserProfilePasswordManagedBy,
};

export interface UserProfileSecurityPanelViewProps
  extends
    Omit<UserProfileActiveDevicesSectionViewProps, 'devices'>,
    Pick<
      UserProfilePasswordSectionViewProps,
      'hasPassword' | 'requiresCurrentPassword' | 'managedBy' | 'onSubmitPassword'
    > {
  passkeys?: UserProfilePasskey[];
  passkeysVisible?: boolean;
  mfaMethods?: UserProfileMfaMethod[];
  addableMfaMethods?: readonly UserProfileMfaAddableMethod[];
  mfaAddControl?: ReactNode;
  devices?: UserProfileDevice[];
  onAddPasskey?: () => void;
  addPasskeyError?: string;
  onRenamePasskey?: (id: string, name: string) => void | Promise<void>;
  onRemovePasskey?: (id: string) => void | Promise<void>;
  onAddMfaMethod?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemoveMfaMethod?: (id: string) => void | Promise<void>;
  onSetDefaultMfaMethod?: (id: string) => void | Promise<void>;
  /** Resolve to close the danger zone's confirmation dialog, reject to show why it failed. */
  onDeleteAccount?: () => Promise<void>;
}

export function UserProfileSecurityPanelView({
  hasPassword = false,
  requiresCurrentPassword,
  managedBy,
  passkeys,
  passkeysVisible = true,
  mfaMethods,
  addableMfaMethods,
  mfaAddControl,
  devices,
  onSubmitPassword,
  onAddPasskey,
  addPasskeyError,
  onRenamePasskey,
  onRemovePasskey,
  onAddMfaMethod,
  onRegenerateBackupCodes,
  onRemoveMfaMethod,
  onSetDefaultMfaMethod,
  onSignOutDevice,
  onSignOutAllOtherDevices,
  onDeleteAccount,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const showPassword = hasPassword || Boolean(onSubmitPassword) || Boolean(managedBy);
  const showPasskeys = passkeys !== undefined && passkeysVisible;
  const hasAuthentication = showPassword || showPasskeys || mfaMethods !== undefined;

  return (
    <div {...mergeStyleProps(themeProps('user-profile-security-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>Security</Profile.PageTitle>
      <div {...stylex.props(styles.sections)}>
        <div {...stylex.props(styles.sectionCards, !hasAuthentication && styles.emptySectionCards)}>
          {showPassword ? (
            <UserProfilePasswordSectionView
              hasPassword={hasPassword}
              managedBy={managedBy}
              requiresCurrentPassword={requiresCurrentPassword}
              onSubmitPassword={onSubmitPassword}
            />
          ) : null}
          {showPasskeys ? (
            <UserProfilePasskeysSectionView
              passkeys={passkeys}
              sectionTitle={showPassword ? undefined : 'Authentication'}
              onAdd={onAddPasskey}
              addError={addPasskeyError}
              onRename={onRenamePasskey}
              onRemove={onRemovePasskey}
            />
          ) : null}
          {mfaMethods !== undefined ? (
            <UserProfileMfaSectionView
              methods={mfaMethods}
              addableMethods={addableMfaMethods}
              addControl={mfaAddControl}
              sectionTitle={!showPassword && !showPasskeys ? 'Authentication' : undefined}
              onAdd={onAddMfaMethod}
              onRegenerateBackupCodes={onRegenerateBackupCodes}
              onRemove={onRemoveMfaMethod}
              onSetDefault={onSetDefaultMfaMethod}
            />
          ) : null}
        </div>
        {devices ? (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutAllOtherDevices={onSignOutAllOtherDevices}
            onSignOutDevice={onSignOutDevice}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </div>
    </div>
  );
}
