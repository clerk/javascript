import * as stylex from '@stylexjs/stylex';

import { IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { styles } from './user-profile-provider-media.styles';

export function UserProfileProviderMedia({
  provider,
  iconUrl,
  monochromeIcon,
}: {
  provider: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
}) {
  const url = iconUrl?.trim();
  return (
    <Section.Media size='lg'>
      <IconFrame filled>
        {url && monochromeIcon ? (
          <span
            aria-hidden
            {...stylex.props(styles.maskedIcon, styles.maskImage(url))}
          />
        ) : url ? (
          <img
            src={url}
            alt=''
            aria-hidden
            {...stylex.props(styles.icon)}
          />
        ) : (
          <span
            aria-hidden
            {...stylex.props(styles.fallback)}
          >
            {provider.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </IconFrame>
    </Section.Media>
  );
}
