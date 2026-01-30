import { type PropsWithChildren, useEffect, useState } from 'react';

import { Box, useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';

type CollapsibleProps = PropsWithChildren<{
  open: boolean;
  sx?: ThemableCssProp;
}>;

// Register custom property for animatable mask size
if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
  try {
    CSS.registerProperty({
      name: '--cl-collapsible-mask-size',
      syntax: '<length>',
      initialValue: '0px',
      inherits: false,
    });
  } catch {
    // Property already registered or not supported
  }
}

export function Collapsible({ open, children, sx }: CollapsibleProps): JSX.Element | null {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations } = useAppearance().parsedOptions;
  const isMotionSafe = !prefersReducedMotion && animations;

  const [shouldRender, setShouldRender] = useState(open);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    if (open) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => setIsExpanded(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsExpanded(false);
    if (!isMotionSafe) {
      setShouldRender(false);
      setIsAnimating(false);
    }
  }, [open, isMotionSafe]);

  function handleTransitionEnd(e: React.TransitionEvent): void {
    if (e.target !== e.currentTarget) {
      return;
    }
    setIsAnimating(false);
    if (!open) {
      setShouldRender(false);
    }
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <Box
      onTransitionEnd={handleTransitionEnd}
      sx={[
        t => ({
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          opacity: isExpanded ? 1 : 0,
          transition: isMotionSafe
            ? `grid-template-rows ${t.transitionDuration.$fast} ease-out, opacity ${t.transitionDuration.$fast} ease-out`
            : 'none',
        }),
        sx,
      ]}
      // @ts-ignore - inert not yet in React types
      inert={!open ? '' : undefined}
    >
      <Box
        sx={t => ({
          overflow: 'hidden',
          minHeight: 0,
          '--cl-collapsible-mask-size': isAnimating ? '0.5rem' : '0px',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - var(--cl-collapsible-mask-size)), transparent)',
          transition: isMotionSafe ? `--cl-collapsible-mask-size ${t.transitionDuration.$slow}` : 'none',
        })}
      >
        {children}
      </Box>
    </Box>
  );
}
