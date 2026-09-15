import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../components/profile';
import { mergeStyleProps, themeProps } from '../props';
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
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';
import { styles } from './user-profile-security-panel.styles';

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

export interface UserProfileSecurityPanelViewProps extends Omit<UserProfileActiveDevicesSectionViewProps, 'devices'> {
  hasPassword?: boolean;
  passkeys?: UserProfilePasskey[];
  mfaMethods?: UserProfileMfaMethod[];
  devices?: UserProfileDevice[];
  onChangePassword?: () => void;
  onAddPasskey?: () => void;
  onManagePasskey?: (id: string) => void;
  onRemovePasskey?: (id: string) => void;
  onAddMfaMethod?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemoveMfaMethod?: (id: string) => void;
  /** Resolve to close the danger zone's confirmation dialog, reject to show why it failed. */
  onDeleteAccount?: () => Promise<void>;
}

export function UserProfileSecurityPanelView({
  hasPassword = false,
  passkeys,
  mfaMethods,
  devices,
  onChangePassword,
  onAddPasskey,
  onManagePasskey,
  onRemovePasskey,
  onAddMfaMethod,
  onRegenerateBackupCodes,
  onRemoveMfaMethod,
  onManageDevice,
  onSignOutDevice,
  onSignOutAllOtherDevices,
  onDeleteAccount,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const hasAuthentication = hasPassword || passkeys !== undefined || mfaMethods !== undefined;

  return (
    <div {...mergeStyleProps(themeProps('user-profile-security-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>Security</Profile.PageTitle>
      <div {...stylex.props(styles.sections)}>
        {hasAuthentication ? (
          <div {...stylex.props(styles.sectionCards)}>
            {hasPassword ? <UserProfilePasswordSectionView onChangePassword={onChangePassword} /> : null}
            {passkeys !== undefined ? (
              <UserProfilePasskeysSectionView
                passkeys={passkeys}
                sectionTitle={hasPassword ? undefined : 'Authentication'}
                onAdd={onAddPasskey}
                onManage={onManagePasskey}
                onRemove={onRemovePasskey}
              />
            ) : null}
            {mfaMethods !== undefined ? (
              <UserProfileMfaSectionView
                methods={mfaMethods}
                sectionTitle={!hasPassword && passkeys === undefined ? 'Authentication' : undefined}
                onAdd={onAddMfaMethod}
                onRegenerateBackupCodes={onRegenerateBackupCodes}
                onRemove={onRemoveMfaMethod}
              />
            ) : null}
          </div>
        ) : null}
        {devices ? (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onManageDevice={onManageDevice}
            onSignOutAllOtherDevices={onSignOutAllOtherDevices}
            onSignOutDevice={onSignOutDevice}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </div>
    </div>
  );
}
