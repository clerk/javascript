'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';

import { useTransition } from '../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useFlowContext } from './flow-context';
import { FlowStepContext, type FlowStepContextValue } from './flow-step-context';

export interface FlowStepProps extends ComponentProps<'div'> {
  ids: readonly string[];
}

function focusIsWithin(root: HTMLElement): boolean {
  const active = root.ownerDocument.activeElement;
  return active === null || active === root.ownerDocument.body || root.contains(active);
}

function firstFocusableInDocumentOrder(elements: Iterable<HTMLElement>): HTMLElement | null {
  let first: HTMLElement | null = null;
  for (const element of elements) {
    if (element.closest('[inert]')) {
      continue;
    }
    if (!first || first.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING) {
      first = element;
    }
  }
  return first;
}

export const FlowStep = React.forwardRef<HTMLDivElement, FlowStepProps>(function FlowStep(props, forwardedRef) {
  const { render, ids, children, ...otherProps } = props;
  const parentStep = useContext(FlowStepContext);
  const parentActive = parentStep?.active ?? true;
  const registerWithParent = parentStep?.registerFocusTarget;
  const unregisterWithParent = parentStep?.unregisterFocusTarget;
  const { value, direction, rootRef, registerActiveStep, unregisterActiveStep } = useFlowContext();
  const open = ids.includes(value);
  const stepRef = useRef<HTMLDivElement | null>(null);
  const activeChildrenRef = useRef(children);
  const focusTargetsRef = useRef(new Set<HTMLElement>());
  const wasOpenRef = useRef(open);

  if (open) {
    activeChildrenRef.current = children;
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

  // A layout effect, so focus moves in the commit that makes the leaving step inert: field to field,
  // which iOS does without dropping the keyboard. A passive effect would leave a frame with none.
  useLayoutEffect(() => {
    const entering = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!entering) {
      return;
    }

    const target = firstFocusableInDocumentOrder(focusTargetsRef.current);
    const root = rootRef.current;
    if (target && root && root.contains(target) && focusIsWithin(root)) {
      target.focus({ preventScroll: true });
    }
  }, [open, rootRef]);

  const registerFocusTarget = useCallback(
    (element: HTMLElement) => {
      focusTargetsRef.current.add(element);
      registerWithParent?.(element);
    },
    [registerWithParent],
  );
  const unregisterFocusTarget = useCallback(
    (element: HTMLElement) => {
      focusTargetsRef.current.delete(element);
      unregisterWithParent?.(element);
    },
    [unregisterWithParent],
  );
  const stepContext = useMemo<FlowStepContextValue>(
    () => ({ active: open && parentActive, registerFocusTarget, unregisterFocusTarget }),
    [open, parentActive, registerFocusTarget, unregisterFocusTarget],
  );

  const defaultProps = {
    ...transitionProps,
    ...inertProps(!open),
    'aria-hidden': !open ? true : undefined,
    style: {
      ...transitionProps.style,
      '--cl-flow-transition-direction': String(direction),
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
