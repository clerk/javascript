import * as stylex from '@stylexjs/stylex';

import { Icon } from '../../components/icon';
import { Section, sectionCompactStyles } from '../../components/section';

/** The enterprise connection a row's value comes from, which is why the row has nothing to edit. */
export interface UserProfileManagedBy {
  name: string;
}

export function UserProfileManagedByLabel({ managedBy, label }: { managedBy: UserProfileManagedBy; label: string }) {
  return (
    <Section.Note
      icon={
        <Icon
          aria-hidden
          name='lock'
          size='sm'
        />
      }
    >
      <span {...stylex.props(sectionCompactStyles.hidden)}>{label}</span>
      <span {...stylex.props(sectionCompactStyles.only)}>{managedBy.name}</span>
    </Section.Note>
  );
}
