import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { fill } from '../../localization/messages';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { stepperSegmentMarker } from './stepper.markers.stylex';
import { segmentStates, styles } from './stepper.styles';

export interface StepperProps extends MosaicElementProps<'div'> {
  value: number;
  max: number;
  onValueChange?: (value: number) => void;
  label?: string;
  /** The current step over the total, with `{step}` and `{total}` filled in. */
  countLabel?: string;
  /** Each segment button's accessible name, with `{step}` filled in. */
  stepLabel?: string;
}

type SegmentState = 'complete' | 'current' | 'upcoming';

/**
 * Shows how far the user is through a fixed number of steps: the current step over the total,
 * and one segment per step. Steps are 1-based. Pass `onValueChange` to make each segment a button
 * that moves to its step.
 *
 * @example
 * <Stepper value={1} max={3} />
 *
 * @example
 * <Stepper value={step} max={3} onValueChange={setStep} />
 */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function MosaicStepper(
  {
    value,
    max,
    onValueChange,
    label = 'Step',
    countLabel = '{step} of {total}',
    stepLabel = 'Step {step}',
    xstyle,
    ...rest
  },
  ref,
) {
  const count = atLeastOne(max);
  const current = Math.min(atLeastOne(value), count);
  const steps = Array.from({ length: count }, (_, index) => index + 1);

  return (
    <div
      ref={ref}
      {...mergeStyleProps(
        themeProps('stepper', { value: current, max: count }),
        stylex.props(reset.base, styles.root, xstyle),
        rest,
      )}
    >
      <span {...mergeStyleProps(themeProps('stepper-text'), stylex.props(reset.base, styles.text))}>
        <span {...mergeStyleProps(themeProps('stepper-label'), stylex.props(reset.base, styles.label))}>{label}</span>{' '}
        <span {...mergeStyleProps(themeProps('stepper-count'), stylex.props(reset.base, styles.count))}>
          {fill(countLabel, { step: current, total: count })}
        </span>
      </span>
      <div
        aria-hidden={onValueChange ? undefined : true}
        {...mergeStyleProps(themeProps('stepper-segments'), stylex.props(reset.base, styles.segments))}
      >
        {steps.map(step => {
          const state = stateOf(step, current);
          if (!onValueChange) {
            return (
              <span
                key={step}
                {...segmentProps(state, false)}
              />
            );
          }
          return (
            <button
              key={step}
              type='button'
              aria-label={fill(stepLabel, { step })}
              aria-current={state === 'current' ? 'step' : undefined}
              onClick={() => onValueChange(step)}
              {...segmentProps(state, true)}
            />
          );
        })}
      </div>
    </div>
  );
});

function segmentProps(state: SegmentState, interactive: boolean) {
  return mergeStyleProps(
    themeProps('stepper-segment', { state }),
    stylex.props(
      reset.base,
      styles.segment,
      segmentStates[state],
      interactive && [
        styles.button,
        focusOutline.visible,
        stepperSegmentMarker,
        state === 'upcoming' && styles.upcomingHover,
      ],
    ),
  );
}

function stateOf(value: number, current: number): SegmentState {
  if (value < current) {
    return 'complete';
  }
  return value === current ? 'current' : 'upcoming';
}

function atLeastOne(value: number): number {
  return Number.isFinite(value) && value > 1 ? Math.floor(value) : 1;
}
