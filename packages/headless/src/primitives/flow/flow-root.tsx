'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { FlowContext, type FlowContextValue, type FlowDirection } from './flow-context';

export interface FlowRootProps extends ComponentProps<'div'> {
  value: string;
  direction?: FlowDirection;
}

export const FlowRoot = React.forwardRef<HTMLDivElement, FlowRootProps>(function FlowRoot(props, forwardedRef) {
  const { render, value, direction = 1, ...otherProps } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState<HTMLElement | null>(null);
  const [activeStepHeight, setActiveStepHeight] = useState<number>();
  const [initial, setInitial] = useState(true);

  const registerActiveStep = useCallback((element: HTMLElement) => {
    setActiveStep(element);
  }, []);

  const unregisterActiveStep = useCallback((element: HTMLElement) => {
    setActiveStep(current => (current === element ? null : current));
  }, []);

  useLayoutEffect(() => {
    if (!activeStep) {
      return;
    }

    const measure = () => {
      setActiveStepHeight(activeStep.getBoundingClientRect().height);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(activeStep);
    return () => observer.disconnect();
  }, [activeStep]);

  useLayoutEffect(() => {
    if (activeStepHeight === undefined || !initial) {
      return;
    }

    const frame = requestAnimationFrame(() => setInitial(false));
    return () => cancelAnimationFrame(frame);
  }, [activeStepHeight, initial]);

  const contextValue = useMemo<FlowContextValue>(
    () => ({ value, direction, registerActiveStep, unregisterActiveStep }),
    [value, direction, registerActiveStep, unregisterActiveStep],
  );

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [rootRef, forwardedRef],
    props: mergeProps<'div'>(
      {
        'data-initial': initial ? '' : undefined,
        style: {
          ['--cl-flow-step-height' as string]: activeStepHeight === undefined ? undefined : `${activeStepHeight}px`,
        },
      },
      otherProps,
    ),
  });

  return <FlowContext.Provider value={contextValue}>{element}</FlowContext.Provider>;
});
