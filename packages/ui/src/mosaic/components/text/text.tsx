import type { RenderPropOrElement } from '@clerk/headless/utils';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { useContextProps } from '../../utils/context';
import type { TypographyColor, TypographySize } from '../typography.styles';
import { colors, sizes } from '../typography.styles';

// `color` replaces the legacy HTML `color` attribute, whose `string` type would widen the variant.
export interface TextProps extends Omit<React.ComponentPropsWithRef<'p'>, 'color'> {
  size?: TypographySize;
  color?: TypographyColor;
  render?: RenderPropOrElement<'p'>;
}

export const TextContext = React.createContext<Partial<TextProps> | null>(null);

/**
 * Themeable body copy. Renders a `<p>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for inline copy (`<span>`).
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(function MosaicText(rawProps, ref) {
  const { size = 'sm', color = 'primary', render, className, style, ...rest } = useContextProps(rawProps, TextContext);

  const props = {
    ...mergeStyleProps(themeProps('text', { size, color }), stylex.props(sizes[size], colors[color]), className, style),
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
