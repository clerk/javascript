import * as stylex from '@stylexjs/stylex';

import { Section } from '../../components/section';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import { styles } from './user-profile-security-panel.styles';

const SKELETON_ITEMS = [0, 1, 2];

export function UserProfileActiveDevicesSectionSkeleton() {
  const m = useMessages('userProfileActiveDevices');

  return (
    <div {...stylex.props(styles.sectionCards)}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Section.Root>
        <Section.Group skeleton>
          <Section.Header>
            <Section.Title />
          </Section.Header>
          <Section.Body>
            <Section.Items>
              {SKELETON_ITEMS.map(item => (
                <Section.Item key={item}>
                  <Section.Media size='lg' />
                  <Section.Content>
                    <Section.Label />
                    <Section.Description />
                  </Section.Content>
                </Section.Item>
              ))}
            </Section.Items>
          </Section.Body>
        </Section.Group>
      </Section.Root>
    </div>
  );
}
