import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { useContextProps } from '../../utils/context';
import { reset } from '../reset.styles';
import type { TypographyColor, TypographySize } from '../typography.styles';
import { colors, sizes, styles } from '../typography.styles';

export interface TextProps extends MosaicComponentProps<'p'> {
  size?: TypographySize;
  color?: TypographyColor;
}

export const TextContext = React.createContext<Partial<TextProps> | null>(null);

/**
 * Themeable body copy. Renders a `<p>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for inline copy (`<span>`).
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(function MosaicText(rawProps, ref) {
  const { size = 'sm', color = 'primary', render, className, style, ...rest } = useContextProps(rawProps, TextContext);

  const props = {
    ...mergeStyleProps(
      themeProps('text', { size, color }),
      stylex.props(reset.base, styles.base, sizes[size], colors[color]),
      className,
      style,
    ),
    ...rest,
  };

  // useRender only runs for `render` (function or element); Emotion processes `css`
  // inside the consumer's own JSX there. The no-render fallback must stay JSX —
  // React.createElement bypasses Emotion's factory, leaking css to the DOM.
  const element = useRender({
    defaultTagName: 'p',
    render,
    ref,
    enabled: Boolean(render),
    props,
  });
  if (element) {
    return element;
  }
  return (
    <p
      ref={ref}
      {...props}
    />
  );
});
