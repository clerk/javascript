import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { visuallyHidden } from '../../utils/visually-hidden.styles';

export type VisuallyHiddenProps = MosaicComponentProps<'span'>;

/**
 * Content exposed to assistive technology but not painted. Renders a `span` by default and
 * forwards its ref; `render` swaps the element where a `span` is not valid in context.
 *
 * @example
 * <Button><Icon name='trash' /><VisuallyHidden>Delete</VisuallyHidden></Button>
 *
 * @example
 * <VisuallyHidden render={<div role='status' aria-live='polite' />}>{feedback}</VisuallyHidden>
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(function MosaicVisuallyHidden(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('visually-hidden'),
        stylex.props(reset.base, visuallyHidden.base),
        className,
        style,
      ),
      ...rest,
    },
  });
});
