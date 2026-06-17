import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

export const avatarRecipe = defineSlotRecipe(theme => ({
  slot: 'avatar',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: `0 0 0 -1px ${theme.alpha('primary', 30)}`,
    flexShrink: 0,
    backgroundColor: theme.color.muted,
    color: theme.color.mutedForeground,
    fontWeight: theme.font.semibold,
  },
  variants: {
    shape: {
      org: { borderRadius: theme.rounded.lg },
      user: { borderRadius: theme.rounded.full },
    },
    size: {
      sm: { width: '1.25rem', height: '1.25rem', ...theme.text('xs') },
      md: { width: '2.5rem', height: '2.5rem', ...theme.text('sm') },
      lg: { width: '3rem', height: '3rem', ...theme.text('base') },
    },
  },
  defaultVariants: { shape: 'org', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    avatar: true;
  }
}

export type AvatarProps = React.ComponentPropsWithRef<'span'> &
  RecipeVariantProps<typeof avatarRecipe> & {
    /** Background color override — e.g. a per-org brand color. */
    color?: string;
    src?: string;
    alt?: string;
  };

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function MosaicAvatar(props, ref) {
  const { shape, size, color, src, alt, sx, children, style, ...rest } = props;
  const { root } = useRecipe(avatarRecipe, { variants: { shape, size }, sx });

  const inlineStyle: React.CSSProperties = {
    ...(color ? { backgroundColor: color } : {}),
    ...style,
  };

  return (
    <span
      ref={ref}
      {...rest}
      {...root}
      style={inlineStyle}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        children
      )}
    </span>
  );
});
