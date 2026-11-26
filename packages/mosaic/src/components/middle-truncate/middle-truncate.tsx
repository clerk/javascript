'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { autoUpdate } from '../../primitives/utils/dom';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../tooltip/tooltip';
import { styles } from './middle-truncate.styles';

export type MiddleTruncateProps = Omit<MosaicElementProps<'span'>, 'children'> & {
  children: string;
  tail: number;
};

/**
 * Single-line text that truncates in the middle, keeping the last `tail` characters visible.
 * Shows the full text in a tooltip while it overflows.
 *
 * @example
 * <MiddleTruncate tail={6}>{userId}</MiddleTruncate>
 *
 * @example
 * <MiddleTruncate tail={email.length - email.lastIndexOf('@')}>{email}</MiddleTruncate>
 */
export const MiddleTruncate = React.forwardRef<HTMLSpanElement, MiddleTruncateProps>(function MosaicMiddleTruncate(
  { children, tail: tailLength, xstyle, ...rest },
  forwardedRef,
) {
  const [head, tail] = splitTail(children, tailLength);
  const [element, setElement] = React.useState<HTMLSpanElement | null>(null);
  const headRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isInsideControl, setIsInsideControl] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const headElement = headRef.current;
    if (!element || !headElement) {
      return;
    }
    setIsInsideControl(element.parentElement?.closest(INTERACTIVE) != null);
    const check = () => setIsOverflowing(headElement.scrollWidth > headElement.clientWidth);
    const stop = autoUpdate([element, headElement], check);
    document.fonts.addEventListener('loadingdone', check);
    return () => {
      stop();
      document.fonts.removeEventListener('loadingdone', check);
    };
  }, [element, children, tailLength]);

  const ref = React.useCallback(
    (node: HTMLSpanElement | null) => {
      setElement(node);
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  return (
    <TooltipRoot
      open={isOverflowing && open}
      onOpenChange={setOpen}
    >
      <TooltipTrigger
        ref={ref}
        render={<span />}
        dir='auto'
        tabIndex={isOverflowing && !isInsideControl ? 0 : undefined}
        aria-describedby={undefined}
        {...mergeStyleProps(
          themeProps('middle-truncate', { overflowing: isOverflowing }),
          stylex.props(reset.base, styles.root, xstyle),
          rest,
        )}
      >
        <span {...stylex.props(styles.head)}>
          <span
            aria-hidden
            {...stylex.props(styles.sizer)}
          >
            {head}
          </span>
          <span {...stylex.props(styles.clip)}>
            <span
              ref={headRef}
              {...stylex.props(styles.text)}
            >
              {head}
            </span>
            <span
              aria-hidden
              {...stylex.props(styles.ellipsis)}
            >
              …
            </span>
          </span>
        </span>
        {tail ? <span {...stylex.props(styles.tail)}>{tail}</span> : null}
      </TooltipTrigger>
      <TooltipPopup>{children}</TooltipPopup>
    </TooltipRoot>
  );
});

const INTERACTIVE =
  'a[href], button, input, select, textarea, [tabindex], [role="button"], [role="menuitem"], [role="option"], [role="link"]';

function splitTail(text: string, tailLength: number): [string, string] {
  const graphemes = toGraphemes(text);
  const count = Math.max(0, Math.floor(tailLength));
  if (count === 0 || graphemes.length <= count) {
    return [text, ''];
  }
  return [graphemes.slice(0, -count).join(''), graphemes.slice(-count).join('')];
}

function toGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), s => s.segment);
  }
  return Array.from(text);
}
