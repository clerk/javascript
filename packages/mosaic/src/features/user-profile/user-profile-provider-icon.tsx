import * as stylex from '@stylexjs/stylex';

import { Icon, IconFrame } from '../../components/icon';
import type { ProviderLogoId } from '../../components/provider-logo';
import { ProviderLogo } from '../../components/provider-logo';
import { Section } from '../../components/section';
import type { IconName } from '../../icons/registry';
import { styles } from './user-profile-profile-panel.styles';

type UserProfileProviderIconProps = { iconUrl: string } | { name: IconName } | { logo: ProviderLogoId };

export function UserProfileProviderIcon(props: UserProfileProviderIconProps) {
  return (
    <Section.Media size='lg'>
      <IconFrame>
        {'logo' in props ? (
          <ProviderLogo
            provider={props.logo}
            xstyle={styles.providerIcon}
          />
        ) : 'iconUrl' in props ? (
          <img
            alt=''
            src={props.iconUrl}
            {...stylex.props(styles.providerIcon)}
          />
        ) : (
          <Icon
            name={props.name}
            xstyle={styles.providerIcon}
          />
        )}
      </IconFrame>
    </Section.Media>
  );
}
