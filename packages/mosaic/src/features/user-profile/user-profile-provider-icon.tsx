import * as stylex from '@stylexjs/stylex';

import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import type { IconComponent } from '../../icons/glyph';
import { styles } from './user-profile-profile-panel.styles';

type UserProfileProviderIconProps = { iconUrl: string; glyph?: never } | { iconUrl?: never; glyph: IconComponent };

export function UserProfileProviderIcon(props: UserProfileProviderIconProps) {
  return (
    <Section.Media size='lg'>
      <IconFrame
        filled
        bordered={false}
      >
        {'iconUrl' in props ? (
          <img
            alt=''
            src={props.iconUrl}
            {...stylex.props(styles.providerIcon)}
          />
        ) : (
          <Icon
            glyph={props.glyph}
            xstyle={styles.providerIcon}
          />
        )}
      </IconFrame>
    </Section.Media>
  );
}
