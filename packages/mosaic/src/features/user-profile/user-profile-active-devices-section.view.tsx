import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { useConfirmationController } from '../../blocks/confirmation/confirmation.controller';
import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import type { MosaicMessages } from '../../localization';
import { fill, plural, useLocale, useMessages } from '../../localization';
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
  const m = useMessages('userProfileActiveDevices');
  const locale = useLocale();
  const deviceDetails = useMemo(() => Dialog.createHandle<UserProfileDevice>(), []);
  const signOutDevice = useMemo(() => Confirmation.createHandle<UserProfileDevice>(), []);
  const currentDevices = devices.filter(device => device.isCurrent);
  const otherDevices = devices.filter(device => !device.isCurrent);

  const openSignOut = onSignOutDevice ? (device: UserProfileDevice) => signOutDevice.open(device) : undefined;

  const currentDeviceTrigger = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: otherDevices.map(device => device.id),
    onRemove: onSignOutDevice,
    fallback: () => currentDeviceTrigger.current,
  });
  const signOutDeviceAt = onSignOutDevice ? (device: UserProfileDevice) => removalFocus.remove(device.id) : undefined;

  const signOutAll = useConfirmationController({ errorFallback: m.signOutAllError });
  const signedOutAll = useRef(false);
  const signOutAllTrigger = useRef<HTMLButtonElement>(null);

  // Confirming removes the other devices and the trigger with them — hence the dialog mounted
  // outside the card, and the current device as the place focus lands. Cancelling keeps the
  // trigger, so focus goes back to it.
  const focusAfterSignOutAll = () => {
    const signedOut = signedOutAll.current;
    signedOutAll.current = false;
    return signedOut ? currentDeviceTrigger.current : signOutAllTrigger.current;
  };

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>{m.title}</Section.Title>
            </Section.Content>
            {onSignOutAllOtherDevices && otherDevices.length > 0 ? (
              <Section.Actions>
                <Button
                  ref={signOutAllTrigger}
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={() => signOutAll.onOpenChange(true)}
                >
                  {m.signOutAll}
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Header>
          <Section.Body>
            <Section.Items>
              {currentDevices.length > 0 ? (
                currentDevices.map(device => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    triggerRef={device.id === currentDevices[0]?.id ? currentDeviceTrigger : undefined}
                    onViewDetails={device => deviceDetails.open(device)}
                  />
                ))
              ) : (
                <Section.Item>
                  <Section.Content>
                    <Section.Description>{m.emptyCurrent}</Section.Description>
                  </Section.Content>
                </Section.Item>
              )}
              {otherDevices.map(device => (
                <DeviceItem
                  key={device.id}
                  device={device}
                  triggerRef={removalFocus.registerTrigger(device.id)}
                  onSignOut={openSignOut}
                  onViewDetails={device => deviceDetails.open(device)}
                />
              ))}
            </Section.Items>
          </Section.Body>
        </Section.Group>
      </Section.Root>
      {onSignOutAllOtherDevices ? (
        <Confirmation
          open={signOutAll.isOpen}
          onOpenChange={signOutAll.onOpenChange}
          color='primary'
          finalFocus={focusAfterSignOutAll}
          title={m.signOutAllDialog.title}
          description={plural(m.signOutAllDialog.description, otherDevices.length, locale)}
          actionLabel={m.signOutAllDialog.confirm}
          cancelLabel={m.signOutAllDialog.cancel}
          onConfirm={() =>
            signOutAll.onConfirm(async () => {
              await onSignOutAllOtherDevices();
              signedOutAll.current = true;
            })
          }
          isConfirming={signOutAll.isConfirming}
          errorMessage={signOutAll.errorMessage}
        />
      ) : null}
      <UserProfileDeviceDetailsDialog
        handle={deviceDetails}
        finalFocus={removalFocus.finalFocus}
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
          finalFocus={removalFocus.finalFocus}
          onConfirm={device => signOutDeviceAt?.(device)}
          errorFallback={m.detailsDialog.signOutError}
        />
      ) : null}
    </div>
  );
}

function deviceBadges(device: UserProfileDevice, m: MosaicMessages['userProfileActiveDevices']): string[] {
  const labels: (string | null)[] = [
    device.isCurrent ? m.thisDevice : null,
    device.isUserDevice ? m.userDevice : null,
    device.isImpersonationDevice ? m.impersonationDevice : null,
  ];
  return labels.filter((label): label is string => label !== null);
}

function DeviceItem({
  device,
  triggerRef,
  onViewDetails,
  onSignOut,
}: {
  device: UserProfileDevice;
  triggerRef?: Ref<HTMLButtonElement>;
  onViewDetails: (device: UserProfileDevice) => void;
  onSignOut?: (device: UserProfileDevice) => void;
}) {
  const m = useMessages('userProfileActiveDevices');
  const actions: ActionMenuAction[] = [{ label: m.viewDetails, onClick: () => onViewDetails(device) }];

  if (onSignOut) {
    actions.push({ label: m.signOut, onClick: () => onSignOut(device) });
  }

  return (
    <Section.Item>
      <UserProfileSecurityIcon name={device.type} />
      <Section.Content>
        <Section.Label>
          {device.name}
          {deviceBadges(device, m).map(label => (
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
        <ActionMenu
          actions={actions}
          label={fill(m.manageLabel, { name: device.name })}
          triggerRef={triggerRef}
        />
      </Section.Actions>
    </Section.Item>
  );
}
