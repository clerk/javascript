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

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

export interface UserProfileSecurityPanelViewProps extends Omit<UserProfileActiveDevicesSectionViewProps, 'devices'> {
  passwordSlot?: ReactNode;
  passkeysSlot?: ReactNode;
  mfaMethods?: UserProfileMfaMethod[];
  addableMfaMethods?: readonly UserProfileMfaAddableMethod[];
  mfaAddControl?: ReactNode;
  devices?: UserProfileDevice[];
  onAddMfaMethod?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemoveMfaMethod?: (id: string) => void | Promise<void>;
  onSetDefaultMfaMethod?: (id: string) => void | Promise<void>;
  /** Danger zone. Omit to hide it. */
  dangerSlot?: ReactNode;
}

export function UserProfileSecurityPanelView({
  passwordSlot,
  passkeysSlot,
  mfaMethods,
  addableMfaMethods,
  mfaAddControl,
  devices,
  onAddMfaMethod,
  onRegenerateBackupCodes,
  onRemoveMfaMethod,
  onSetDefaultMfaMethod,
  onSignOutDevice,
  onSignOutAllOtherDevices,
  dangerSlot,
}: UserProfileSecurityPanelViewProps): ReactElement {
  const hasAuthentication = passwordSlot != null || Boolean(passkeysSlot) || mfaMethods !== undefined;

  return (
    <Panel.Root render={<div {...themeProps('user-profile-security-panel')} />}>
      <Panel.Title>Security</Panel.Title>
      <Panel.Sections>
        {hasAuthentication ? (
          <Section.Root aria-label='Authentication'>
            {passwordSlot}
            {passkeysSlot}
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
        {dangerSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
