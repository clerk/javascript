import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';

import { panelStyles, Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
import type {
  UserProfileActiveDevicesSectionViewProps,
  UserProfileDevice,
} from './user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from './user-profile-mfa-section.view';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from './user-profile-passkeys-section.view';
import { styles } from './user-profile-security-panel.styles';

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

export interface UserProfileSecurityPanelViewProps extends Omit<UserProfileActiveDevicesSectionViewProps, 'devices'> {
  /**
   * The password section. Omit it when passwords are unavailable rather than passing a section that renders
   * nothing, so the Authentication heading stays correct.
   */
  passwordSlot?: ReactNode;
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
  /** Danger zone. Omit to hide it. */
  deleteAccountSlot?: ReactNode;
}

export function UserProfileSecurityPanelView({
  passwordSlot,
  passkeys,
  passkeysVisible = true,
  mfaMethods,
  addableMfaMethods,
  mfaAddControl,
  devices,
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
  deleteAccountSlot,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const showPassword = Boolean(passwordSlot);
  const showPasskeys = passkeys !== undefined && passkeysVisible;
  const hasAuthentication = showPassword || showPasskeys || mfaMethods !== undefined;

  return (
    <div {...mergeStyleProps(themeProps('user-profile-security-panel'), stylex.props(panelStyles.root))}>
      <Profile.PageTitle>Security</Profile.PageTitle>
      <div {...stylex.props(panelStyles.sections)}>
        <div {...stylex.props(styles.sectionCards, !hasAuthentication && styles.emptySectionCards)}>
          {passwordSlot}
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
        {deleteAccountSlot}
      </div>
    </div>
  );
}
