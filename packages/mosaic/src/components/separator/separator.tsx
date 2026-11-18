import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { styles } from './separator.styles';

export type SeparatorProps = MosaicComponentProps<'div'>;

/**
 * A horizontal rule between blocks of content. Without children it is a plain 1px line;
 * with children it is a labelled divider, with a line on each side of the label.
 *
 * @example
 * <Separator />
 *
 * @example
 * <Separator>or</Separator>
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function MosaicSeparator(
  { children, render, xstyle, ...rest },
  ref,
) {
  const labelled = hasLabel(children);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('separator', { labelled }),
        stylex.props(reset.base, labelled ? styles.labelled : styles.plain, xstyle),
        rest,
      ),
      role: 'separator',
      children,
    },
  });
});

function hasLabel(children: React.ReactNode): boolean {
  return children != null && children !== false && children !== '';
}
