import * as stylex from '@stylexjs/stylex';

import { Icon } from '../../../components/icon';
import { Section, sectionCompactStyles } from '../../../components/section';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { styles } from './user-profile-password-section.styles';
import type {
  UserProfilePasswordManagedBy,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section.types';

export function UserProfilePasswordRowView({
  action,
  hasPassword = false,
  managedBy,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfilePasswordSection');
  return (
    <Section.Items>
      <Section.Item>
        <Section.Content>
          <Section.Description>{hasPassword ? m.masked : m.noPasswordSet}</Section.Description>
        </Section.Content>
        {action ? (
          <Section.Actions>{action}</Section.Actions>
        ) : managedBy ? (
          <Section.Actions>
            <ManagedByLabel {...managedBy} />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Items>
  );
}

function ManagedByLabel({ name }: UserProfilePasswordManagedBy) {
  const m = useMessages('userProfilePasswordSection');
  return (
    <div {...stylex.props(styles.managedBy)}>
      <Icon
        name='lock'
        size='sm'
        xstyle={styles.managedByText}
      />
      <Text
        render={<span />}
        size='sm'
        xstyle={styles.managedByText}
      >
        <span {...stylex.props(sectionCompactStyles.hidden)}>{fill(m.managedBy, { name })}</span>
        <span {...stylex.props(sectionCompactStyles.only)}>{name}</span>
      </Text>
    </div>
  );
}
