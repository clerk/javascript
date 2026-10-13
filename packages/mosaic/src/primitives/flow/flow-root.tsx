'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useAnimationsFinished } from '../hooks/use-animations-finished';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { autoUpdate, getDimensions } from '../utils/dom';
import { FlowContext, type FlowContextValue, type FlowDirection } from './flow-context';

function isHeightTransition(animation: Animation): boolean {
  return 'transitionProperty' in animation && animation.transitionProperty === 'height';
}

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
  const [transitioning, setTransitioning] = useState(false);
  const lastActiveStepRef = useRef<HTMLElement | null>(null);
  const stepHeightRef = useRef<number | null>(null);
  const runOnHeightTransitionFinished = useAnimationsFinished(rootRef, false, isHeightTransition);

  const registerActiveStep = useCallback((element: HTMLElement) => {
    if (lastActiveStepRef.current && lastActiveStepRef.current !== element) {
      setTransitioning(true);
    }
    lastActiveStepRef.current = element;
    setActiveStep(element);
  }, []);

  const unregisterActiveStep = useCallback((element: HTMLElement) => {
    setActiveStep(current => (current === element ? null : current));
  }, []);

  useLayoutEffect(() => {
    if (!activeStep) {
      return;
    }

    return autoUpdate(activeStep, () => {
      const root = rootRef.current;
      const { height } = getDimensions(activeStep);
      if (root && stepHeightRef.current !== null && height !== stepHeightRef.current) {
        root.dataset.heightChange = height < stepHeightRef.current ? 'shrink' : 'grow';
      }
      stepHeightRef.current = height;
      root?.style.setProperty('--cl-flow-step-height', `${height}px`);
      setMeasured(true);
    });
  }, [activeStep]);

  useLayoutEffect(() => {
    if (!transitioning) {
      return;
    }

    return runOnHeightTransitionFinished(() => setTransitioning(false));
  }, [transitioning, activeStep, runOnHeightTransitionFinished]);

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
    }),
    [value, direction, registerActiveStep, unregisterActiveStep],
  );

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [rootRef, forwardedRef],
    props: mergeProps<'div'>(
      {
        'data-initial': initial ? '' : undefined,
        'data-transitioning': transitioning ? '' : undefined,
      },
      otherProps,
    ),
  });

  return <FlowContext.Provider value={contextValue}>{element}</FlowContext.Provider>;
});
