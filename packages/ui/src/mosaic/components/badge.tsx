import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

export const badgeRecipe = defineSlotRecipe(theme => ({
  slot: 'badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: theme.spacing(1.5),
    paddingBlock: theme.spacing(0.75),
    borderRadius: theme.rounded.md,
    ...theme.text('xs'),
    fontWeight: theme.font.medium,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  variants: {
    intent: {
      default: {
        background: theme.color.muted,
        color: theme.color.mutedForeground,
      },
      primary: {
        background: 'light-dark(rgba(108,71,255,0.08), rgba(108,71,255,0.18))',
        color: '#6c47ff',
      },
      positive: {
        background: 'light-dark(rgba(34,197,94,0.1), rgba(34,197,94,0.18))',
        color: 'light-dark(#16a34a, #4ade80)',
      },
      negative: {
        background: 'light-dark(rgba(220,38,38,0.08), rgba(220,38,38,0.18))',
        color: theme.color.destructive,
      },
    },
  },
  defaultVariants: { intent: 'default' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    badge: true;
  }
}

export type BadgeProps = React.ComponentPropsWithRef<'span'> & RecipeVariantProps<typeof badgeRecipe>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function MosaicBadge(props, ref) {
  const { intent, sx, children, ...rest } = props;
  const { root } = useRecipe(badgeRecipe, { variants: { intent }, sx });
  return (
    <span
      ref={ref}
      {...rest}
      {...root}
    >
      {children}
    </span>
  );
});
