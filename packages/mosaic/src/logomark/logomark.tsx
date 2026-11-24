import * as React from 'react';

import type { AvatarProps } from '../components/avatar';
import { Avatar } from '../components/avatar';
import { useMosaicOptions } from '../hooks/use-mosaic-options';
import { styles } from './logomark.styles';

export type MosaicLogomark = React.ReactElement | false;

export type ResolvedLogomark = { render: React.ReactElement } | { src: string; fit: 'cover' | 'contain' };

export function useLogomark(fallback: { logomarkUrl?: string; logoUrl?: string }): ResolvedLogomark | null {
  const { logomark } = useMosaicOptions();
  if (logomark === false) {
    return null;
  }
  if (logomark) {
    return { render: logomark };
  }
  if (fallback.logomarkUrl) {
    return { src: fallback.logomarkUrl, fit: 'cover' };
  }
  return fallback.logoUrl ? { src: fallback.logoUrl, fit: 'contain' } : null;
}

export interface LogomarkProps extends AvatarProps {
  logomark: ResolvedLogomark;
  alt: string;
}

export function Logomark({ logomark, alt, ...props }: LogomarkProps): React.ReactElement {
  return (
    <Avatar.Root {...props}>
      {'src' in logomark ? (
        <Avatar.Image
          alt={alt}
          src={logomark.src}
          xstyle={logomark.fit === 'contain' && styles.contain}
        />
      ) : (
        <Avatar.Image
          alt={alt}
          render={logomark.render}
        />
      )}
    </Avatar.Root>
  );
}
