import * as stylex from '@stylexjs/stylex';

import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { IconName } from '../icons/registry';
import { styles } from './user-profile-profile-panel.styles';

type UserProfileProviderIconProps = { iconUrl: string; name?: never } | { iconUrl?: never; name: IconName };

// TODO: Replace this temporary user-profile wrapper with IconFrame.
export function UserProfileProviderIcon(props: UserProfileProviderIconProps) {
  return (
    <Section.Media
      size='lg'
      {...stylex.props(styles.providerMedia)}
    >
      {'iconUrl' in props ? (
        <img
          alt=''
          src={props.iconUrl}
          {...stylex.props(styles.providerIcon)}
        />
      ) : (
        <Icon
          aria-hidden
          name={props.name}
          {...stylex.props(styles.providerIcon)}
        />
      )}
    </Section.Media>
  );
}
