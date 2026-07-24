import type { RenderProp } from '@clerk/headless/utils';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { useContextProps } from '../../utils/context';
import type { TypographyIntent, TypographySize } from '../typography.styles';
import { intents, sizes } from '../typography.styles';
import { styles } from './heading.styles';

export interface HeadingProps extends React.ComponentPropsWithRef<'h2'> {
  size?: TypographySize;
  intent?: TypographyIntent;
  render?: RenderProp<React.ComponentPropsWithRef<'h2'>> | React.ReactElement;
}

export const HeadingContext = React.createContext<Partial<HeadingProps> | null>(null);

/**
 * Themeable heading. Renders an `<h2>` by default, forwards refs, and supports
 * `size` and `intent` variants. Pass `render` for a different heading level.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function MosaicHeading(rawProps, ref) {
  const {
    size = 'base',
    intent = 'primary',
    render,
    className,
    style,
    ...rest
  } = useContextProps(rawProps, HeadingContext);

  const props = {
    ...mergeStyleProps(
      themeProps('heading', { size, intent }),
      stylex.props(styles.base, sizes[size], intents[intent]),
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
