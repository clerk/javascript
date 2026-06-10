import type { StyleRule } from './cva';

/** Wraps styles in `@media (hover: hover)` so they only apply on hover-capable devices. */
export function hover(styles: StyleRule): StyleRule {
  return {
    '@media (hover: hover)': {
      '&:hover': styles,
    },
  };
}

/** Wraps styles in `@media (prefers-reduced-motion: no-preference)` so animations only run when the user has not requested reduced motion. */
export function motionSafe(styles: StyleRule): StyleRule {
  return {
    '@media (prefers-reduced-motion: no-preference)': styles,
  };
}

/** Applies opacity to any CSS color via `color-mix`. */
export function alpha(color: string, opacity: number): string {
  return `color-mix(in oklab, ${color} ${opacity}%, transparent)`;
}
