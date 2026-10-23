import * as stylex from '@stylexjs/stylex';

import { IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { mergeStyleProps, themeProps } from '../../props';
import { kebabCase } from '../../utils/kebab-case';
import { styles } from './user-profile-provider-media.styles';

export function UserProfileProviderMedia({
  provider,
  iconId,
  iconUrl,
  monochromeIcon,
}: {
  provider: string;
  iconId?: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
}) {
  const url = iconUrl?.trim();
  const slot = themeProps('provider-icon', { provider: iconId && kebabCase(iconId) });
  const offset = iconId === 'apple' && styles.appleOffset;
  return (
    <Section.Media size='lg'>
      <IconFrame
        filled
        bordered={false}
      >
        {url && monochromeIcon ? (
          <span
            aria-hidden
            {...mergeStyleProps(slot, stylex.props(styles.maskedIcon, styles.maskImage(url), offset))}
          />
        ) : url ? (
          <img
            src={url}
            alt=''
            aria-hidden
            {...mergeStyleProps(slot, stylex.props(styles.icon, offset))}
          />
        ) : (
          <span
            aria-hidden
            {...mergeStyleProps(slot, stylex.props(styles.fallback))}
          >
            {provider.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </IconFrame>
    </Section.Media>
  );
}
