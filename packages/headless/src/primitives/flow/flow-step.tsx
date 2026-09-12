'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useAnimationsFinished } from '../../hooks/use-animations-finished';
import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFlowContext } from './flow-context';
import { FlowStepContext, type FlowStepContextValue } from './flow-step-context';

export interface FlowStepProps extends ComponentProps<'div'> {
  ids: readonly string[];
}

function focusIsWithin(root: HTMLElement): boolean {
  const active = root.ownerDocument.activeElement;
  return active === null || active === root.ownerDocument.body || root.contains(active);
}

function firstInDocumentOrder(elements: Iterable<HTMLElement>): HTMLElement | null {
  let first: HTMLElement | null = null;
  for (const element of elements) {
    if (!first || first.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING) {
      first = element;
    }
  }
  return first;
}

export const FlowStep = React.forwardRef<HTMLDivElement, FlowStepProps>(function FlowStep(props, forwardedRef) {
  const { render, ids, children, ...otherProps } = props;
  const { value, direction, rootRef, registerActiveStep, unregisterActiveStep } = useFlowContext();
  const open = ids.includes(value);
  const stepRef = useRef<HTMLDivElement | null>(null);
  const activeChildrenRef = useRef(children);
  const hasBeenClosed = useRef(false);
  const focusTargetsRef = useRef(new Set<HTMLElement>());
  const wasOpenRef = useRef(open);

  if (open) {
    activeChildrenRef.current = children;
  } else {
    hasBeenClosed.current = true;
  }

  const { mounted, transitionProps } = useTransition({ open, ref: stepRef });
  const runOnEntered = useAnimationsFinished(stepRef, open);

  useLayoutEffect(() => {
    const element = stepRef.current;
    if (!open || !element) {
      return;
    }

    registerActiveStep(element);
    return () => unregisterActiveStep(element);
  }, [open, registerActiveStep, unregisterActiveStep]);

  useEffect(() => {
    const entering = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!entering) {
      return;
    }

    return runOnEntered(() => {
      const target = firstInDocumentOrder(focusTargetsRef.current);
      const root = rootRef.current;
      if (target && root && focusIsWithin(root)) {
        target.focus({ preventScroll: true });
      }
    });
  }, [open, rootRef, runOnEntered]);

  const registerFocusTarget = useCallback((element: HTMLElement) => {
    focusTargetsRef.current.add(element);
  }, []);
  const unregisterFocusTarget = useCallback((element: HTMLElement) => {
    focusTargetsRef.current.delete(element);
  }, []);
  const stepContext = useMemo<FlowStepContextValue>(
    () => ({ registerFocusTarget, unregisterFocusTarget }),
    [registerFocusTarget, unregisterFocusTarget],
  );

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

  const element = useRender({
    defaultTagName: 'div',
    enabled: mounted,
    render,
    ref: [stepRef, forwardedRef],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return <FlowStepContext.Provider value={stepContext}>{element}</FlowStepContext.Provider>;
});
