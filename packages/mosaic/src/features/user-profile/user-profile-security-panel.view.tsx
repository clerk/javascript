import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { Section } from '../../components/section';
import { themeProps } from '../../props';
import type {
  UserProfileActiveDevicesSectionViewProps,
  UserProfileDevice,
} from './user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';
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
  /** Danger zone. Omit to hide it. */
  deleteAccountSlot?: ReactNode;
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
  deleteAccountSlot,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const showPassword = hasPassword || Boolean(onSubmitPassword) || Boolean(managedBy);
  const showPasskeys = passkeys !== undefined && passkeysVisible;
  const hasAuthentication = showPassword || showPasskeys || mfaMethods !== undefined;

  return (
    <Panel.Root render={<div {...themeProps('user-profile-security-panel')} />}>
      <Panel.Title>Security</Panel.Title>
      <Panel.Sections>
        {hasAuthentication ? (
          <Section.Root aria-label='Authentication'>
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
                onAdd={onAddMfaMethod}
                onRegenerateBackupCodes={onRegenerateBackupCodes}
                onRemove={onRemoveMfaMethod}
                onSetDefault={onSetDefaultMfaMethod}
              />
            ) : null}
          </Section.Root>
        ) : null}
        {devices ? (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutAllOtherDevices={onSignOutAllOtherDevices}
            onSignOutDevice={onSignOutDevice}
          />
        ) : null}
        {deleteAccountSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
