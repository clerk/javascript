import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { TextContext } from '../text';
import { headerAlignments, styles } from './card.styles';

type CardAlignment = 'start' | 'center';

const CardVariantContext = React.createContext<{ alignment: CardAlignment }>({ alignment: 'start' });

const Root = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardRoot(
  { className, style, ...props },
  ref,
) {
  const { alignment } = React.useContext(CardVariantContext);
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('card-root', { alignment }), stylex.props(styles.root), className, style)}
      {...props}
    />
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
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('card-footer'), stylex.props(styles.footer), className, style)}
      {...props}
    />
  );
});

export interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  alignment?: CardAlignment;
}

export function Card({ alignment = 'start', children, ...props }: CardProps) {
  return (
    <CardVariantContext.Provider value={{ alignment }}>
      <Root {...props}>{children}</Root>
    </CardVariantContext.Provider>
  );
}

Card.Root = Root;
Card.Header = Header;
Card.Content = Content;
Card.Footer = Footer;
