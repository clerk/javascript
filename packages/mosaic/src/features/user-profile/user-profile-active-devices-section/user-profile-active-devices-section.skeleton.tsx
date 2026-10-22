import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Section } from '../../../components/section';
import { Skeleton } from '../../../components/skeleton';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { useMessages } from '../../../localization';
import { UserProfileSecurityIcon } from '../user-profile-security-icon';
import { styles } from '../user-profile-security-panel.styles';
import type { UserProfileDevice } from './user-profile-active-devices.types';

const PLACEHOLDER_DEVICES: UserProfileDevice[] = [
  { id: 'current', name: 'Chrome on macOS', description: 'San Francisco, US', type: 'desktop' },
  { id: 'phone', name: 'Safari on iOS', description: 'San Francisco, US', type: 'mobile' },
];

export function UserProfileActiveDevicesSectionSkeleton() {
  const m = useMessages('userProfileActiveDevices');
  return (
    <div {...stylex.props(styles.sectionCards)}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>{m.title}</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body>
            <Section.Items aria-hidden>
              {PLACEHOLDER_DEVICES.map(device => (
                <Section.Item key={device.id}>
                  <Skeleton show>
                    <UserProfileSecurityIcon name={device.type} />
                  </Skeleton>
                  <Section.Content>
                    <Section.Label>
                      <Skeleton show>{device.name}</Skeleton>
                    </Section.Label>
                    <Section.Description>
                      <Skeleton show>{device.description}</Skeleton>
                    </Section.Description>
                  </Section.Content>
                  <Section.Actions>
                    <Skeleton
                      show
                      visible={false}
                    >
                      <ActionMenu
                        actions={[{ label: m.viewDetails, onClick: () => undefined }]}
                        label={m.viewDetails}
                        disabled
                      />
                    </Skeleton>
                  </Section.Actions>
                </Section.Item>
              ))}
            </Section.Items>
          </Section.Body>
        </Section.Group>
      </Section.Root>
    </div>
  );
}
