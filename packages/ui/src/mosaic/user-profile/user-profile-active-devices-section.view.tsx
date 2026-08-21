import * as stylex from '@stylexjs/stylex';

import { Button } from '../components/button';
import { Section } from '../components/section';
import type { UserProfileDeviceDetails } from './dialogs/flow.types';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { styles } from './user-profile-security-panel.styles';

export interface UserProfileDevice {
  id: string;
  name: string;
  description?: string;
  type: 'desktop' | 'mobile';
  isCurrent?: boolean;
  details?: Omit<UserProfileDeviceDetails, 'id'>;
}

export interface UserProfileActiveDevicesSectionViewProps {
  devices: UserProfileDevice[];
  onManageDevice?: (id: string) => void;
  onSignOutDevice?: (id: string) => void;
  onSignOutAllOtherDevices?: () => void;
}

export function UserProfileActiveDevicesSectionView({
  devices,
  onManageDevice,
  onSignOutDevice,
  onSignOutAllOtherDevices,
}: UserProfileActiveDevicesSectionViewProps) {
  const currentDevices = devices.filter(device => device.isCurrent);
  const otherDevices = devices.filter(device => !device.isCurrent);

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <Section.Root>
        <Section.Title>Active devices</Section.Title>
        <Section.Group>
          {currentDevices.length > 0 ? (
            currentDevices.map(device => (
              <Section.Row key={device.id}>
                <DeviceItem device={device} />
              </Section.Row>
            ))
          ) : (
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Description>No current device available</Section.Description>
                </Section.Content>
              </Section.Item>
            </Section.Row>
          )}
        </Section.Group>
      </Section.Root>
      {otherDevices.length > 0 ? (
        <Section.Root aria-label='Other devices'>
          <Section.Group>
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Label>
                    {otherDevices.length} other {otherDevices.length === 1 ? 'device' : 'devices'}
                  </Section.Label>
                </Section.Content>
                {onSignOutAllOtherDevices ? (
                  <Section.Actions>
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                      onClick={onSignOutAllOtherDevices}
                    >
                      Sign out of all other devices
                    </Button>
                  </Section.Actions>
                ) : null}
              </Section.Item>
              <Section.Items>
                {otherDevices.map(device => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    onManage={onManageDevice}
                    onSignOut={onSignOutDevice}
                  />
                ))}
              </Section.Items>
            </Section.Row>
          </Section.Group>
        </Section.Root>
      ) : null}
    </div>
  );
}

function DeviceItem({
  device,
  onManage,
  onSignOut,
}: {
  device: UserProfileDevice;
  onManage?: (id: string) => void;
  onSignOut?: (id: string) => void;
}) {
  const actions: UserProfileMenuAction[] = [];

  if (onManage) {
    actions.push({ label: 'Manage', onClick: () => onManage(device.id) });
  }
  if (onSignOut) {
    actions.push({ label: 'Sign out', color: 'negative', onClick: () => onSignOut(device.id) });
  }

  return (
    <Section.Item>
      <UserProfileSecurityIcon name={device.type} />
      <Section.Content>
        <Section.Label>{device.name}</Section.Label>
        {device.isCurrent || device.description ? (
          <Section.Description {...stylex.props(styles.descriptionLine)}>
            {device.isCurrent ? <span {...stylex.props(styles.currentDevice)}>This device</span> : null}
            {device.isCurrent && device.description ? <span>·</span> : null}
            {device.description ? <span>{device.description}</span> : null}
          </Section.Description>
        ) : null}
      </Section.Content>
      <Section.Actions>
        <UserProfileActionMenu
          actions={actions}
          label={`Manage ${device.name}`}
        />
      </Section.Actions>
    </Section.Item>
  );
}
