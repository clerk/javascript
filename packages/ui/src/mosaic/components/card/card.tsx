import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { TextContext } from '../text';
import { elevations, headerAlignments, styles } from './card.styles';

type CardAlignment = 'start' | 'center';
type CardElevation = 'card' | 'flush' | 'overlay';

const DEFAULT_ALIGNMENT: CardAlignment = 'start';
const DEFAULT_ELEVATION: CardElevation = 'card';

const CardVariantContext = React.createContext<{ alignment: CardAlignment; elevation: CardElevation }>({
  alignment: DEFAULT_ALIGNMENT,
  elevation: DEFAULT_ELEVATION,
});

/** Props for `Card.Root`, including native `div` props and the Mosaic `render` escape hatch. */
export interface CardProps extends MosaicComponentProps<'div'> {
  /** Alignment applied to `Card.Header`. @default 'start' */
  alignment?: CardAlignment;
  /** Surface treatment applied to the card. @default 'card' */
  elevation?: CardElevation;
}

const Root = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  { alignment = DEFAULT_ALIGNMENT, elevation = DEFAULT_ELEVATION, render, className, style, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-root', { alignment, elevation }),
        stylex.props(styles.root, elevations[elevation]),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <CardVariantContext.Provider value={{ alignment, elevation }}>{element}</CardVariantContext.Provider>;
});

const Header = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardHeader(
  { render, className, style, ...rest },
  ref,
) {
  const { alignment } = React.useContext(CardVariantContext);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-header', { alignment }),
        stylex.props(styles.header, headerAlignments[alignment]),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <TextContext.Provider value={{ color: 'neutral' }}>{element}</TextContext.Provider>;
});

const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardContent(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-content'), stylex.props(styles.content), className, style),
      ...rest,
    },
  });
});

const Footer = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardFooter(
  { render, className, style, ...rest },
  ref,
) {
  const { elevation } = React.useContext(CardVariantContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-footer', { elevation }), stylex.props(styles.footer), className, style),
      ...rest,
    },
  });
});

/**
 * A styled surface composed through `Card.Root`, `Card.Header`, `Card.Content`, and `Card.Footer`.
 * Every part accepts the Mosaic `render` prop and forwards its ref.
 */
export const Card = { Root, Header, Content, Footer };
