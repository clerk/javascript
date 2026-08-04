import { Box, descriptors } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';

type SkeletonProps = PropsOfComponent<typeof Box> & {
  /** When false, render children as-is instead of the loading placeholder. Defaults to true. */
  show?: boolean;
};

/**
 * Decorative placeholder for loading states with a subtle shimmer. Two modes:
 *
 * - **Block** — `<Skeleton sx={{ width, height }} />` reserves space with a plain bar.
 * - **Content** — `<Skeleton><Button /></Skeleton>` sizes to the wrapped children (rendered
 *   invisibly) so the placeholder matches the real content and nothing shifts on load.
 *
 * Pass `show={false}` to render the children normally. Targetable via the `skeleton` descriptor.
 */
export const Skeleton = (props: SkeletonProps) => {
  const { show = true, sx, children, ...rest } = props;
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!show) {
    return <>{children}</>;
  }

  return (
    <Box
      as='span'
      aria-hidden
      elementDescriptor={descriptors.skeleton}
      sx={[
        t => ({
          position: 'relative',
          display: children ? 'inline-block' : 'block',
          overflow: 'hidden',
          borderRadius: t.radii.$md,
          backgroundColor: t.colors.$neutralAlpha100,
          '> *': { visibility: 'hidden' },
          '::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, ${t.colors.$transparent} 0%, ${t.colors.$neutralAlpha50} 50%, ${t.colors.$transparent} 100%)`,
            backgroundSize: '200% 100%',
            animation: prefersReducedMotion
              ? 'none'
              : `${animations.loadingShimmer} 1.5s ${t.transitionTiming.$slowBezier} infinite`,
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
};
