import * as React from 'react';

import type { AvatarProps } from '../components/avatar';
import { Avatar } from '../components/avatar';
import { styles } from './logomark.styles';

export interface ResolvedLogomark {
  src: string;
  fit: 'cover' | 'contain';
}

export function useLogomark(fallback: { logomarkUrl?: string; logoUrl?: string }): ResolvedLogomark | null {
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
      <Avatar.Image
        alt={alt}
        src={logomark.src}
        xstyle={logomark.fit === 'contain' && styles.contain}
      />
    </Avatar.Root>
  );
}
