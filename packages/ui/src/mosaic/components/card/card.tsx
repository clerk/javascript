import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { TextContext } from '../text';
import { elevations, headerAlignments, styles } from './card.styles';

type CardAlignment = 'start' | 'center';
type CardElevation = 'raised' | 'flush' | 'overlay';

const CardVariantContext = React.createContext<{ alignment: CardAlignment; elevation: CardElevation }>({
  alignment: 'start',
  elevation: 'raised',
});

export interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  alignment?: CardAlignment;
  elevation?: CardElevation;
}

const Root = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  { alignment = 'start', elevation = 'raised', children, className, style, ...props },
  ref,
) {
  return (
    <CardVariantContext.Provider value={{ alignment, elevation }}>
      <div
        ref={ref}
        {...mergeStyleProps(
          themeProps('card-root', { alignment, elevation }),
          stylex.props(styles.root, elevations[elevation]),
          className,
          style,
        )}
        {...props}
      >
        {children}
      </div>
    </CardVariantContext.Provider>
  );
});

const Header = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardHeader(
  { className, style, ...props },
  ref,
) {
  const { alignment } = React.useContext(CardVariantContext);
  return (
    <TextContext.Provider value={{ color: 'neutral' }}>
      <div
        ref={ref}
        {...mergeStyleProps(
          themeProps('card-header', { alignment }),
          stylex.props(styles.header, headerAlignments[alignment]),
          className,
          style,
        )}
        {...props}
      />
    </TextContext.Provider>
  );
});

const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardContent(
  { className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('card-content'), stylex.props(styles.content), className, style)}
      {...props}
    />
  );
});

const Footer = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardFooter(
  { className, style, ...props },
  ref,
) {
  const { elevation } = React.useContext(CardVariantContext);
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('card-footer', { elevation }), stylex.props(styles.footer), className, style)}
      {...props}
    />
  );
});

export const Card = { Root, Header, Content, Footer };
