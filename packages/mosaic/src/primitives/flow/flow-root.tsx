'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { autoUpdate, getDimensions } from '../utils/dom';
import { FlowContext, type FlowContextValue, type FlowDirection } from './flow-context';

export interface FlowRootProps extends ComponentProps<'div'> {
  value: string;
  direction?: FlowDirection;
}

export const FlowRoot = React.forwardRef<HTMLDivElement, FlowRootProps>(function FlowRoot(props, forwardedRef) {
  const { render, value, direction = 1, ...otherProps } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState<HTMLElement | null>(null);
  const [measured, setMeasured] = useState(false);
  const [initial, setInitial] = useState(true);
  const [exitingSteps, setExitingSteps] = useState<ReadonlySet<HTMLElement>>(() => new Set());

  const registerActiveStep = useCallback((element: HTMLElement) => {
    setActiveStep(element);
  }, []);

  const unregisterActiveStep = useCallback((element: HTMLElement) => {
    setActiveStep(current => (current === element ? null : current));
  }, []);

  const registerExitingStep = useCallback((element: HTMLElement) => {
    setExitingSteps(current => new Set(current).add(element));
  }, []);

  const unregisterExitingStep = useCallback((element: HTMLElement) => {
    setExitingSteps(current => {
      if (!current.has(element)) {
        return current;
      }
      const next = new Set(current);
      next.delete(element);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    if (!activeStep) {
      return;
    }

    return autoUpdate(activeStep, () => {
      rootRef.current?.style.setProperty('--cl-flow-step-height', `${getDimensions(activeStep).height}px`);
      setMeasured(true);
    });
  }, [activeStep]);

  useLayoutEffect(() => {
    if (!measured || !initial) {
      return;
    }

    const frame = requestAnimationFrame(() => setInitial(false));
    return () => cancelAnimationFrame(frame);
  }, [measured, initial]);

  const contextValue = useMemo<FlowContextValue>(
    () => ({
      value,
      direction,
      rootRef,
      registerActiveStep,
      unregisterActiveStep,
      registerExitingStep,
      unregisterExitingStep,
    }),
    [value, direction, registerActiveStep, unregisterActiveStep, registerExitingStep, unregisterExitingStep],
  );

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [rootRef, forwardedRef],
    props: mergeProps<'div'>(
      {
        'data-initial': initial ? '' : undefined,
        'data-transitioning': exitingSteps.size > 0 ? '' : undefined,
      },
      otherProps,
    ),
  });

  return <FlowContext.Provider value={contextValue}>{element}</FlowContext.Provider>;
});
