import * as stylex from '@stylexjs/stylex';

import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { Spinner } from '../components/spinner';
import { Section } from '../components/section';
import type { UserProfileDeviceDetails } from './dialogs/flow.types';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { styles } from './user-profile-security-panel.styles';
import { fill, plural, userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileDevice {
  id: string;
  name: string;
  description?: string;
  type: 'desktop' | 'mobile';
  isCurrent?: boolean;
  status?: 'active' | 'pending' | 'ended';
  relationship?: 'current' | 'current-impersonating' | 'user-device' | 'other-impersonator' | 'other';
  isRevoking?: boolean;
  details?: Omit<UserProfileDeviceDetails, 'id'>;
}

export interface UserProfileActiveDevicesSectionViewProps {
  devices: UserProfileDevice[];
  onManageDevice?: (id: string) => void;
  onSignOutDevice?: (id: string) => void;
  onSignOutAllOtherDevices?: () => void;
  status?: 'loading' | 'ready' | 'error';
  error?: string;
}

export function UserProfileActiveDevicesSectionView({
  devices,
  onManageDevice,
  onSignOutDevice,
  onSignOutAllOtherDevices,
  status = 'ready',
  error,
}: UserProfileActiveDevicesSectionViewProps) {
  const visibleDevices = devices.filter(
    device => !device.status || device.status === 'active' || device.status === 'pending',
  );
  const currentDevices = visibleDevices.filter(device => device.isCurrent);
  const otherDevices = visibleDevices.filter(device => !device.isCurrent);

  if (status === 'loading') {
    return (
      <Section.Root>
        <Section.Title>{m.devices.title}</Section.Title>
        <Section.Group>
          <Section.Row>
            <Section.Item>
              <span
                aria-label={m.devices.loading}
                role='status'
              >
                <Spinner />
              </span>
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>
    );
  }

  if (status === 'error') {
    return (
      <Section.Root>
        <Section.Title>{m.devices.title}</Section.Title>
        <Section.Group>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Description>{error ?? m.devices.loadError}</Section.Description>
              </Section.Content>
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>
    );
  }

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <Section.Root>
        <Section.Title>{m.devices.title}</Section.Title>
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
                  <Section.Description>{m.devices.noCurrent}</Section.Description>
                </Section.Content>
              </Section.Item>
            </Section.Row>
          )}
        </Section.Group>
      </Section.Root>
      {otherDevices.length > 0 ? (
        <Section.Root aria-label={m.devices.other}>
          <Section.Group>
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Label>{plural(m.devices.otherCount, otherDevices.length)}</Section.Label>
                </Section.Content>
                {onSignOutAllOtherDevices ? (
                  <Section.Actions>
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                      onClick={onSignOutAllOtherDevices}
                    >
                      {m.devices.signOutAllOthers}
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

  if (onManage && !device.isRevoking) {
    actions.push({ label: m.devices.manage, onClick: () => onManage(device.id) });
  }
  if (onSignOut && !device.isRevoking) {
    actions.push({ label: m.common.signOut, color: 'negative', onClick: () => onSignOut(device.id) });
  }

  return (
    <Section.Item aria-disabled={device.isRevoking || undefined}>
      <UserProfileSecurityIcon name={device.type} />
      <Section.Content>
        <Section.Label>
          {device.name}{' '}
          {device.relationship === 'current' || device.relationship === 'current-impersonating' ? (
            <Badge color={device.relationship === 'current-impersonating' ? 'negative' : 'primary'}>
              {m.devices.thisDevice}
            </Badge>
          ) : null}
          {device.relationship === 'user-device' ? <Badge color='neutral'>{m.devices.userDevice}</Badge> : null}
          {device.relationship === 'other-impersonator' ? (
            <Badge color='negative'>{m.devices.otherImpersonator}</Badge>
          ) : null}
        </Section.Label>
        {device.isCurrent || device.description ? (
          <Section.Description {...stylex.props(styles.descriptionLine)}>
            {device.isCurrent && !device.relationship ? (
              <span {...stylex.props(styles.currentDevice)}>{m.devices.thisDevice}</span>
            ) : null}
            {device.isCurrent && !device.relationship && device.description ? <span>·</span> : null}
            {device.description ? <span>{device.description}</span> : null}
          </Section.Description>
        ) : null}
      </Section.Content>
      <Section.Actions>
        <UserProfileActionMenu
          actions={actions}
          label={fill(m.devices.manageDevice, { name: device.name })}
        />
      </Section.Actions>
    </Section.Item>
  );
}
