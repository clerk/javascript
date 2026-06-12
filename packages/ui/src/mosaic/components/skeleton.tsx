import { keyframes } from '@emotion/react';
import type { ReactNode } from 'react';

import type { SxProp } from '../slot-recipe';
import { Box, type BoxProps } from './box';

const pulse = keyframes({
  '50%': { opacity: 0.5 },
});

export type SkeletonProps = Omit<BoxProps, 'sx' | 'children'> & {
  /**
   * Wrap real content to size the skeleton to it exactly. The content is rendered
   * invisibly (so width, height, and line wrapping match), and a bar is painted over
   * each text line. Omit for a plain block sized by `width`/`height`.
   */
  children?: ReactNode;
  /** Block width when no children — a number is treated as px. Defaults to `100%`. */
  width?: string | number;
  /** Block height when no children — a number is treated as px. Defaults to `1rem`. */
  height?: string | number;
  sx?: SxProp;
};

/**
 * Animated placeholder for loading states. Two modes:
 *
 * - **Block** (`<Skeleton width={150} height='2.25rem' />`) — a single rounded bar.
 * - **Content** (`<Skeleton><h2>…</h2></Skeleton>`) — sizes to the wrapped content and
 *   paints one bar per text line, so multi-line text yields multiple bars that match the
 *   real wrapping.
 *
 * Decorative only (`aria-hidden` + `inert`) — pair with an accessible loading
 * announcement at the container level if needed.
 */
export function Skeleton({ children, width = '100%', height = '1rem', sx, ...rest }: SkeletonProps) {
  return (
    <Box
      aria-hidden
      // @ts-expect-error `inert` typing varies by React version; the attribute is valid.
      inert='true'
      sx={t => ({
        borderRadius: t.rounded.md,
        animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        ...(children
          ? {
              // Content mode: invisible content sets the size; one bar per line via a
              // gradient tiled to the element's own line height (`1lh`).
              display: 'inline-block',
              maxWidth: '100%',
              color: 'transparent',
              userSelect: 'none',
              backgroundImage: `linear-gradient(to bottom, transparent 0 12%, ${t.color.muted} 12% 88%, transparent 88% 100%)`,
              backgroundSize: '100% 1lh',
              backgroundRepeat: 'repeat-y',
            }
          : {
              // Block mode: explicit dimensions.
              width,
              height,
              backgroundColor: t.color.muted,
            }),
        ...(typeof sx === 'function' ? sx(t) : sx),
      })}
      {...rest}
    >
      {children}
    </Box>
  );
}
