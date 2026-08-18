import * as stylex from '@stylexjs/stylex';

import { Section } from '../components/section';
import { styles } from './user-profile-profile-panel.styles';

export function UserProfileProviderIcon({ iconUrl }: { iconUrl: string }) {
  return (
    <Section.Media
      size='lg'
      {...stylex.props(styles.providerMedia)}
    >
      <img
        alt=''
        src={iconUrl}
        {...stylex.props(styles.providerIcon)}
      />
    </Section.Media>
  );
}
