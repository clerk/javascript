/** @jsxImportSource @emotion/react */
import React from 'react';

import { cva, type VariantProps } from '../cva';
import { useMosaicTheme } from '../MosaicProvider';

export const tooltipStyles = cva(theme => ({
  base: {
    position: 'absolute',
    zIndex: 50,
    width: 'max-content',
    maxWidth: '18rem',
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    borderRadius: theme.rounded.md,
    backgroundColor: theme.color.primary,
    color: theme.color.primaryForeground,
    fontWeight: 500,
    ...theme.text('xs'),
    pointerEvents: 'none',
    whiteSpace: 'normal',
  },
  variants: {
    side: {
      top: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: theme.spacing(2),
      },
      bottom: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: theme.spacing(2),
      },
      left: {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: theme.spacing(2),
      },
      right: {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: theme.spacing(2),
      },
    },
  },
  defaultVariants: { side: 'top' },
}));

export type TooltipProps = Omit<React.ComponentPropsWithRef<'div'>, 'content'> &
  VariantProps<typeof tooltipStyles> & {
    /** The content shown inside the tooltip bubble. */
    content: React.ReactNode;
  };

/**
 * Wraps a trigger and reveals `content` on hover or keyboard focus.
 *
 * The trigger element is passed as `children`; the tooltip is positioned relative
 * to it via the `side` variant. Focus and blur bubble up from the trigger, so the
 * tooltip is reachable by keyboard without extra wiring.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(function MosaicTooltip(props, ref) {
  const { side, sx, content, children, ...rest } = props;
  const theme = useMosaicTheme();
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();

  return (
    <div
      ref={ref}
      css={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? tooltipId : undefined}
      {...rest}
    >
      {children}
      {open ? (
        <div
          id={tooltipId}
          role='tooltip'
          css={tooltipStyles({ side, sx })(theme)}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
});
