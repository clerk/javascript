import { Flow as HeadlessFlow, type FlowDirection } from '@clerk/headless/flow';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { styles } from './flow.styles';

export interface FlowRootProps<State> extends Omit<MosaicComponentProps<'div'>, 'children'> {
  /** Controlled value used to select the active step. */
  value: string;
  /** Direction of travel between steps. */
  direction?: FlowDirection;
  /** Opaque state supplied to the active step. */
  state: State;
  children: (state: State) => React.ReactNode;
}

export interface FlowStepProps extends Omit<MosaicComponentProps<'div'>, 'id'> {
  /** Controlled values rendered by this step. */
  ids: readonly string[];
}

function FlowRoot<State>(
  { value, direction, state, render, className, style, children, ...rest }: FlowRootProps<State>,
  ref: React.ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <HeadlessFlow.Root
      {...mergeStyleProps(themeProps('flow-root', { value }), stylex.props(reset.base), className, style)}
      {...rest}
      ref={ref}
      render={render}
      value={value}
      direction={direction}
    >
      {children(state)}
    </HeadlessFlow.Root>
  );
}

type FlowRootComponent = <State>(
  props: FlowRootProps<State> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;

const Root = React.forwardRef(FlowRoot) as FlowRootComponent;

const Step = React.forwardRef<HTMLDivElement, FlowStepProps>(function FlowStep(
  { ids, render, className, style, children, ...rest },
  ref,
) {
  return (
    <HeadlessFlow.Step
      {...mergeStyleProps(
        themeProps('flow-step', { step: ids[0] }),
        stylex.props(reset.base, styles.step),
        className,
        style,
      )}
      {...rest}
      ref={ref}
      render={render}
      ids={ids}
    >
      {children}
    </HeadlessFlow.Step>
  );
});

/** A controlled set of screens driven by opaque caller state. */
export const Flow = { Root, Step };

export type { FlowDirection };
