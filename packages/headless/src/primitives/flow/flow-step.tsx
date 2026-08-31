'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useLayoutEffect, useRef } from 'react';

import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFlowContext } from './flow-context';

export interface FlowStepProps extends ComponentProps<'div'> {
  ids: readonly string[];
}

export const FlowStep = React.forwardRef<HTMLDivElement, FlowStepProps>(function FlowStep(props, forwardedRef) {
  const { render, ids, children, ...otherProps } = props;
  const { value, direction, registerActiveStep, unregisterActiveStep } = useFlowContext();
  const open = ids.includes(value);
  const stepRef = useRef<HTMLDivElement | null>(null);
  const activeChildrenRef = useRef(children);
  const hasBeenClosed = useRef(false);

  if (open) {
    activeChildrenRef.current = children;
  } else {
    hasBeenClosed.current = true;
  }

  const { mounted, transitionProps } = useTransition({ open, ref: stepRef });

  useLayoutEffect(() => {
    const element = stepRef.current;
    if (!open || !element) {
      return;
    }

    registerActiveStep(element);
    return () => unregisterActiveStep(element);
  }, [open, registerActiveStep, unregisterActiveStep]);

  const effectiveTransitionProps = !hasBeenClosed.current
    ? { ...transitionProps, 'data-starting-style': undefined, style: undefined }
    : transitionProps;

  const defaultProps = {
    ...effectiveTransitionProps,
    ...inertProps(!open),
    'aria-hidden': !open ? true : undefined,
    style: {
      ...effectiveTransitionProps.style,
      ['--cl-flow-transition-direction' as string]: String(direction),
    },
    children: open ? children : activeChildrenRef.current,
  };

  return useRender({
    defaultTagName: 'div',
    enabled: mounted,
    render,
    ref: [stepRef, forwardedRef],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
