import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useTransition } from '../../primitives/hooks';
import { Freeze, useRender } from '../../primitives/utils';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { reveal } from './reveal.styles';

export type RevealProps = MosaicElementProps<'div'> & {
  open: boolean;
};

export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(function MosaicReveal(
  { open, xstyle, children, ...rest },
  ref,
) {
  const element = React.useRef<HTMLElement | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const [hasBeenClosed, setHasBeenClosed] = React.useState(!open);
  if (!open && !hasBeenClosed) {
    setHasBeenClosed(true);
  }
  const effectiveTransitionProps = hasBeenClosed
    ? transitionProps
    : { ...transitionProps, 'data-starting-style': undefined, style: undefined };

  return useRender({
    defaultTagName: 'div',
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
