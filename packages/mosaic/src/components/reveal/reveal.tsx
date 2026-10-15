import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useTransition } from '../../primitives/hooks';
import { Freeze, useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { reveal } from './reveal.styles';

export interface RevealProps extends MosaicComponentProps<'div'> {
  open: boolean;
}

export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(function MosaicReveal(
  { open, render, xstyle, children, ...rest },
  ref,
) {
  const element = React.useRef<HTMLElement | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const hasBeenClosed = React.useRef(!open);
  if (!open) {
    hasBeenClosed.current = true;
  }
  const effectiveTransitionProps = hasBeenClosed.current
    ? transitionProps
    : { ...transitionProps, 'data-starting-style': undefined, style: undefined };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, element],
    props: {
      ...mergeStyleProps(
        themeProps('reveal'),
        stylex.props(reset.base, reveal.root, xstyle),
        { ...effectiveTransitionProps },
        rest,
      ),
      children: (
        <div
          {...inertProps(!open)}
          {...stylex.props(reset.base, reveal.clip)}
        >
          {mounted ? <Freeze frozen={!open}>{children}</Freeze> : null}
        </div>
      ),
    },
  });
});
