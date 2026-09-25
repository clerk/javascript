import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { Section } from '../../components/section';
import { themeProps } from '../../props';
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
    <Panel.Root render={<div {...themeProps('user-profile-security-panel')} />}>
      <Panel.Title>Security</Panel.Title>
      <Panel.Sections>
        {hasAuthentication ? (
          <Section.Root>
            {showPassword ? (
              <UserProfilePasswordSectionView
                asGroup
                hasPassword={hasPassword}
                managedBy={managedBy}
                requiresCurrentPassword={requiresCurrentPassword}
                onSubmitPassword={onSubmitPassword}
              />
            ) : null}
            {showPasskeys ? (
              <UserProfilePasskeysSectionView
                asGroup
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
                asGroup
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
          </Section.Root>
        ) : null}
        {devices ? (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutAllOtherDevices={onSignOutAllOtherDevices}
            onSignOutDevice={onSignOutDevice}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </Panel.Sections>
    </Panel.Root>
  );
}
