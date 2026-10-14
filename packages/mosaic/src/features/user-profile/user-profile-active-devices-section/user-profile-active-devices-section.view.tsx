import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import type { MosaicMessages } from '../../../localization';
import { fill, plural, useLocale, useMessages } from '../../../localization';
import { UserProfileSecurityIcon } from '../user-profile-security-icon';
import { styles } from '../user-profile-security-panel.styles';
import type { UserProfileDevice } from './user-profile-active-devices.types';
import type { UserProfileActiveDevicesController } from './user-profile-active-devices-section.controller';
import { UserProfileDeviceDetailsDialog } from './user-profile-device-details.dialog';

export type { UserProfileDevice };

export type UserProfileActiveDevicesSectionViewProps = UserProfileActiveDevicesController;

export function UserProfileActiveDevicesSectionView({
  devices,
  currentDeviceTriggerRef,
  signOutAllTriggerRef,
  registerTrigger,
  finalFocus,
  details,
  signOutFromDetails,
  signOut,
  signOutAll,
  signOutAllFinalFocus,
}: UserProfileActiveDevicesSectionViewProps) {
  const m = useMessages('userProfileActiveDevices');
  const locale = useLocale();
  const currentDevices = devices.filter(device => device.isCurrent);
  const otherDevices = devices.filter(device => !device.isCurrent);

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>{m.title}</Section.Title>
            </Section.Content>
            {signOutAll && otherDevices.length > 0 ? (
              <Section.Actions>
                <Button
                  ref={signOutAllTriggerRef}
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={() => signOutAll.open()}
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
                    triggerRef={device.id === currentDevices[0]?.id ? currentDeviceTriggerRef : undefined}
                    onViewDetails={device => details.open(device)}
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
                  triggerRef={registerTrigger(device.id)}
                  onSignOut={signOut ? device => signOut.open(device) : undefined}
                  onViewDetails={device => details.open(device)}
                />
              ))}
            </Section.Items>
          </Section.Body>
        </Section.Group>
      </Section.Root>
      {signOutAll ? (
        <Confirmation
          controller={signOutAll}
          color='primary'
          finalFocus={signOutAllFinalFocus}
          title={m.signOutAllDialog.title}
          description={plural(m.signOutAllDialog.description, otherDevices.length, locale)}
          actionLabel={m.signOutAllDialog.confirm}
          cancelLabel={m.signOutAllDialog.cancel}
        />
      ) : null}
      <UserProfileDeviceDetailsDialog
        controller={details}
        devices={devices}
        finalFocus={finalFocus}
        onSignOut={signOutFromDetails}
      />
      {signOut ? (
        <Confirmation
          color='primary'
          controller={signOut}
          title={m.signOutDialog.title}
          description={device => fill(m.signOutDialog.description, { name: device.name })}
          actionLabel={m.signOutDialog.confirm}
          cancelLabel={m.signOutDialog.cancel}
          finalFocus={finalFocus}
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
