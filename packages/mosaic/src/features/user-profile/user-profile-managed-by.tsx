import * as stylex from '@stylexjs/stylex';

import { Icon } from '../../components/icon';
import { Section } from '../../components/section';

/** The enterprise connection a row's value comes from, which is why the row has nothing to edit. */
export interface UserProfileManagedBy {
  name: string;
  iconUrl?: string;
}

const styles = stylex.create({
  logo: {
    height: '100%',
    width: '100%',
  },
});

export function UserProfileManagedByLabel({ iconUrl, children }: { iconUrl?: string; children: string }) {
  return (
    <Section.Note
      icon={
        iconUrl ? (
          <img
            alt=''
            src={iconUrl}
            {...stylex.props(styles.logo)}
          />
        ) : (
          <Icon
            aria-hidden
            name='lock'
            size='sm'
          />
        )
      }
    >
      {children}
    </Section.Note>
  );
}
