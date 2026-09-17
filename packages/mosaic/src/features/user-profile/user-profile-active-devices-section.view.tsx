import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Badge } from '../../components/badge';
import { SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Section } from '../../components/section';
import { fill } from '../../utils/messages';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfileActiveDevicesMessages as m } from './user-profile-active-devices.messages';
import type { UserProfileDevice } from './user-profile-active-devices.types';
import { UserProfileDeviceDetailsDialog } from './user-profile-device-details.dialog';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { styles } from './user-profile-security-panel.styles';

export type { UserProfileDevice };

export interface UserProfileActiveDevicesSectionViewProps {
  devices: UserProfileDevice[];
  onSignOutDevice?: (id: string) => void | Promise<void>;
  onSignOutAllOtherDevices?: () => void | Promise<void>;
}

export function UserProfileActiveDevicesSectionView({
  devices,
  onSignOutDevice,
  onSignOutAllOtherDevices,
}: UserProfileActiveDevicesSectionViewProps) {
  const deviceDetails = useMemo(() => Dialog.createHandle<UserProfileDevice>(), []);
  const signOutDevice = useMemo(() => Confirmation.createHandle<UserProfileDevice>(), []);
  const currentDevices = devices.filter(device => device.isCurrent);
  const otherDevices = devices.filter(device => !device.isCurrent);

  const openSignOut = onSignOutDevice ? (device: UserProfileDevice) => signOutDevice.open(device) : undefined;

  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const signedOut = useRef<number | undefined>(undefined);

  const registerTrigger = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      triggers.current.set(id, element);
    } else {
      triggers.current.delete(id);
    }
  };

  const signOutDeviceAt = onSignOutDevice
    ? async (device: UserProfileDevice) => {
        const index = otherDevices.findIndex(other => other.id === device.id);
        await onSignOutDevice(device.id);
        // Recorded only once the device is really gone, so a cancelled or failed attempt still
        // returns focus to the row's own menu.
        signedOut.current = index;
      }
    : undefined;

  // The row the dialog was opened from has just unmounted, so focus goes to whichever row took
  // its place — the last one if it was the last, the current device once none are left.
  const focusAfterSignOut = () => {
    const index = signedOut.current;
    signedOut.current = undefined;
    if (index === undefined) {
      return null;
    }
    const remaining = devices.filter(device => !device.isCurrent);
    const next = remaining[Math.min(index, remaining.length - 1)] ?? currentDevices[0];
    return (next && triggers.current.get(next.id)) ?? null;
  };

  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [signOutAllError, setSignOutAllError] = useState<string>();
  const signingOutAll = useRef(false);

  const signOutAllOtherDevices = async () => {
    if (!onSignOutAllOtherDevices || signingOutAll.current) {
      return;
    }
    signingOutAll.current = true;
    setIsSigningOutAll(true);
    setSignOutAllError(undefined);
    try {
      await onSignOutAllOtherDevices();
    } catch (error) {
      setSignOutAllError(error instanceof Error ? error.message : m.signOutAllError);
    } finally {
      signingOutAll.current = false;
      setIsSigningOutAll(false);
    }
  };

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <Section.Root>
        <Section.Title>{m.title}</Section.Title>
        <Section.Group>
          {currentDevices.length > 0 ? (
            currentDevices.map(device => (
              <Section.Row key={device.id}>
                <DeviceItem
                  device={device}
                  triggerRef={registerTrigger(device.id)}
                  onViewDetails={device => deviceDetails.open(device)}
                />
              </Section.Row>
            ))
          ) : (
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Description>{m.emptyCurrent}</Section.Description>
                </Section.Content>
              </Section.Item>
            </Section.Row>
          )}
        </Section.Group>
      </Section.Root>
      {otherDevices.length > 0 ? (
        <Section.Root aria-label={m.otherDevicesTitle}>
          <Section.Group>
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Label>
                    {fill(otherDevices.length === 1 ? m.otherDevice : m.otherDevices, {
                      count: String(otherDevices.length),
                    })}
                  </Section.Label>
                </Section.Content>
                {onSignOutAllOtherDevices ? (
                  <Section.Actions>
                    <SubmitButton
                      type='button'
                      color='neutral'
                      size='sm'
                      variant='outline'
                      isPending={isSigningOutAll}
                      onClick={() => void signOutAllOtherDevices()}
                    >
                      {m.signOutAll}
                    </SubmitButton>
                  </Section.Actions>
                ) : null}
              </Section.Item>
              {signOutAllError ? <Section.Error>{signOutAllError}</Section.Error> : null}
              <Section.Items>
                {otherDevices.map(device => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    triggerRef={registerTrigger(device.id)}
                    onSignOut={openSignOut}
                    onViewDetails={device => deviceDetails.open(device)}
                  />
                ))}
              </Section.Items>
            </Section.Row>
          </Section.Group>
        </Section.Root>
      ) : null}
      <UserProfileDeviceDetailsDialog
        handle={deviceDetails}
        finalFocus={focusAfterSignOut}
        onSignOut={signOutDeviceAt}
      />
      {onSignOutDevice ? (
        <Confirmation
          color='primary'
          handle={signOutDevice}
          title={m.signOutDialog.title}
          description={device => fill(m.signOutDialog.description, { name: device.name })}
          actionLabel={m.signOutDialog.confirm}
          cancelLabel={m.signOutDialog.cancel}
          finalFocus={focusAfterSignOut}
          onConfirm={device => signOutDeviceAt?.(device)}
        />
      ) : null}
    </div>
  );
}

function deviceBadges(device: UserProfileDevice): string[] {
  return [
    device.isCurrent ? m.thisDevice : null,
    device.isUserDevice ? m.userDevice : null,
    device.isImpersonationDevice ? m.impersonationDevice : null,
  ].filter((label): label is string => label !== null);
}

function DeviceItem({
  device,
  triggerRef,
  onViewDetails,
  onSignOut,
}: {
  device: UserProfileDevice;
  triggerRef: (element: HTMLButtonElement | null) => void;
  onViewDetails: (device: UserProfileDevice) => void;
  onSignOut?: (device: UserProfileDevice) => void;
}) {
  const actions: UserProfileMenuAction[] = [{ label: m.viewDetails, onClick: () => onViewDetails(device) }];

  if (onSignOut) {
    actions.push({ label: m.signOut, onClick: () => onSignOut(device) });
  }

  return (
    <Section.Item>
      <UserProfileSecurityIcon name={device.type} />
      <Section.Content>
        <Section.Label xstyle={styles.deviceLabel}>
          <span>{device.name}</span>
          {deviceBadges(device).map(label => (
            <Badge
              key={label}
              color='neutral'
            >
              {label}
            </Badge>
          ))}
        </Section.Label>
        {device.description ? <Section.Description>{device.description}</Section.Description> : null}
      </Section.Content>
      <Section.Actions>
        <UserProfileActionMenu
          actions={actions}
          label={fill(m.manageLabel, { name: device.name })}
          triggerRef={triggerRef}
        />
      </Section.Actions>
    </Section.Item>
  );
}
