'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTooltipContext } from './tooltip-context';

export type TooltipPositionerProps = ComponentProps<'div'>;

export const TooltipPositioner = React.forwardRef<HTMLDivElement, TooltipPositionerProps>(
  function TooltipPositioner(props, ref) {
    const { render, ...otherProps } = props;
    const { mounted, refs, floatingStyles, placement, getFloatingProps } = useTooltipContext();

    // floating-ui types `setFloating` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const combinedRef = useMergeRefs([refs.setFloating, ref]);

    const side = placement.split('-')[0];
    const floatingProps = getFloatingProps() as React.ComponentPropsWithRef<'div'>;
    const wiredId = floatingProps.id;

    const defaultProps = {
      'data-cl-slot': 'tooltip-positioner',
      'data-cl-side': side,
      ref: combinedRef,
      style: floatingStyles,
      ...floatingProps,
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by floating-ui: it pairs with the trigger's aria-describedby.
    // A consumer-supplied id must not override it, or the aria pairing would silently break.
    merged.id = wiredId;

    return renderElement({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      props: merged,
    });
  },
);
