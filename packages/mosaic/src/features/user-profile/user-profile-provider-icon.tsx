import * as stylex from '@stylexjs/stylex';

import { Icon, IconFrame } from '../../components/icon';
import type { ProviderLogoGlyph } from '../../components/provider-logo';
import { ProviderLogo } from '../../components/provider-logo';
import { Section } from '../../components/section';
import type { IconName } from '../../icons/registry';
import { styles } from './user-profile-profile-panel.styles';

export type UserProfileProviderIconProps =
  | { logo: ProviderLogoGlyph }
  | { iconUrl: string }
  | { name: IconName }
  | { initial: string };

function ProviderIconContent(props: UserProfileProviderIconProps) {
  if ('logo' in props) {
    return (
      <ProviderLogo
        glyph={props.logo}
        xstyle={styles.providerIcon}
      />
    );
  }
  if ('iconUrl' in props) {
    return (
      <img
        alt=''
        src={props.iconUrl}
        {...stylex.props(styles.providerIcon)}
      />
    );
  }
  if ('name' in props) {
    return (
      <Icon
        name={props.name}
        xstyle={styles.providerIcon}
      />
    );
  }
  return (
    <span
      aria-hidden
      {...stylex.props(styles.providerIcon, styles.providerInitial)}
    >
      {props.initial}
    </span>
  );
}

export function UserProfileProviderIcon(props: UserProfileProviderIconProps) {
  return (
    <Section.Media size='lg'>
      <IconFrame>
        <ProviderIconContent {...props} />
      </IconFrame>
    </Section.Media>
  );
}
