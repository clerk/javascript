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
import type { UserProfilePasswordSlot } from './user-profile-password-section/user-profile-password-section.types';

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

export interface UserProfileSecurityPanelViewProps extends Omit<UserProfileActiveDevicesSectionViewProps, 'devices'> {
  passwordSlot?: UserProfilePasswordSlot | null;
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
    <Panel.Root render={<div {...themeProps('user-profile-security-panel')} />}>
      <Panel.Title>Security</Panel.Title>
      <Panel.Sections>
        {hasAuthentication ? (
          <Section.Root aria-label='Authentication'>
            {passwordSlot?.content}
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
