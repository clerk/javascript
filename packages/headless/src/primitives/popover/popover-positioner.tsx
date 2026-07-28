'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { usePopoverContext } from './popover-context';

export type PopoverPositionerProps = ComponentProps<'div'>;

export const PopoverPositioner = React.forwardRef<HTMLDivElement, PopoverPositionerProps>(
  function PopoverPositioner(props, ref) {
    const { render, ...otherProps } = props;
    const {
      mounted,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getFloatingProps,
      modal,
      labelId,
      descriptionId,
      hasTitle,
      hasDescription,
    } = usePopoverContext();

    const side = placement.split('-')[0];

    const ownProps = {
      'data-side': side,
      style: floatingStyles,
      ...(hasTitle && { 'aria-labelledby': labelId }),
      ...(hasDescription && { 'aria-describedby': descriptionId }),
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...getFloatingProps() };

    const element = useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      // floating-ui types `setFloating` as a method signature, but at runtime it's
      // a stable callback that doesn't use `this`, so the unbound-method check is a
      // false positive here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: [refs.setFloating, ref],
      props: mergeProps<'div'>(defaultProps, otherProps),
    });

    if (!element) {
      return null;
    }

    return (
      <FloatingFocusManager
        context={floatingContext}
        modal={modal}
      >
        {element}
      </FloatingFocusManager>
    );
  },
);
