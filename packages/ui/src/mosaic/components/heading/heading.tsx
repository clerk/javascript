import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { useContextProps } from '../../utils/context';
import { reset } from '../reset.styles';
import type { TypographyColor, TypographySize } from '../typography.styles';
import { colors, sizes, styles as typographyStyles } from '../typography.styles';
import { styles as headingStyles } from './heading.styles';

export interface HeadingProps extends MosaicComponentProps<'h2'> {
  size?: TypographySize;
  color?: TypographyColor;
}

export const HeadingContext = React.createContext<Partial<HeadingProps> | null>(null);

/**
 * Themeable heading. Renders an `<h2>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for a different heading level.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function MosaicHeading(rawProps, ref) {
  const {
    size = 'base',
    color = 'primary',
    render,
    className,
    style,
    ...rest
  } = useContextProps(rawProps, HeadingContext);

  const props = {
    ...mergeStyleProps(
      themeProps('heading', { size, color }),
      stylex.props(reset.base, typographyStyles.base, headingStyles.base, sizes[size], colors[color]),
      className,
      style,
    ),
    ...rest,
  };

  // useRender only runs for `render` (function or element); Emotion processes `css`
  // inside the consumer's own JSX there. The no-render fallback must stay JSX —
  // React.createElement bypasses Emotion's factory, leaking css to the DOM.
  const element = useRender({
    defaultTagName: 'h2',
    render,
    ref,
    enabled: Boolean(render),
    props,
  });
  if (element) {
    return element;
  }
  return (
    <h2
      ref={ref}
      {...props}
    />
  );
});
