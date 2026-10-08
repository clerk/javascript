'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { parsePlacement } from '../utils/side-offset';
import { useTooltipContext } from './tooltip-context';

export type TooltipPositionerProps = ComponentProps<'div'>;

export const TooltipPositioner = React.forwardRef<HTMLDivElement, TooltipPositionerProps>(
  function TooltipPositioner(props, ref) {
    const { render, ...otherProps } = props;
    const { mounted, refs, floatingStyles, placement, getFloatingProps } = useTooltipContext();

    const side = parsePlacement(placement).side;
    const floatingProps = getFloatingProps();
    const wiredId = floatingProps.id;

    const ownProps = {
      'data-side': side,
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by floating-ui: it pairs with the trigger's aria-describedby.
    // A consumer-supplied id must not override it, or the aria pairing would silently break.
    merged.id = wiredId;

    return useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setFloating` as a method, but it is a stable callback that does not use `this`.
      ref: [refs.setFloating, ref],
      props: merged,
    });
  },
);
