import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import { TextContext } from './text';

export const cardRecipe = defineSlotRecipe(theme => ({
  slots: {
    root: { slot: 'card-root' },
    header: { slot: 'card-header' },
    content: { slot: 'card-content' },
    footer: { slot: 'card-footer' },
  },
  base: {
    root: {
      backgroundColor: theme.color.card,
      color: theme.color.cardForeground,
      borderRadius: theme.rounded.lg,
      display: 'flex',
      flexDirection: 'column',
      rowGap: theme.spacing(5),
      width: '100%',
      overflow: 'hidden',
      border: `1px solid ${theme.color.border}`,
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      paddingBlockStart: theme.spacing(5),
      paddingInline: theme.spacing(4),
    },
    content: {
      paddingInline: theme.spacing(4),
      flex: '1 1 auto',
    },
    footer: {
      paddingBlockEnd: theme.spacing(5),
      paddingInline: theme.spacing(4),
    },
  },
  variants: {
    alignment: {
      start: {
        header: { alignItems: 'flex-start', textAlign: 'start' },
      },
      center: {
        header: { alignItems: 'center', textAlign: 'center' },
      },
    },
  },
  defaultVariants: {
    alignment: 'start',
  },
}));

type CardVariantProps = RecipeVariantProps<typeof cardRecipe>;

const CardVariantContext = React.createContext<CardVariantProps>({});

declare module '../registry' {
  interface MosaicSlotRegistry {
    'card-root': true;
    'card-header': true;
    'card-content': true;
    'card-footer': true;
  }
}

const Root = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardRoot(props, ref) {
  const variantProps = React.useContext(CardVariantContext);
  const { root } = useRecipe(cardRecipe, { variants: variantProps });
  return (
    <div
      ref={ref}
      {...root}
      {...props}
    />
  );
});

const Header = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardHeader(props, ref) {
  const variantProps = React.useContext(CardVariantContext);
  const { header } = useRecipe(cardRecipe, { variants: variantProps });
  return (
    <TextContext.Provider value={{ intent: 'mutedForeground' }}>
      <div
        ref={ref}
        {...header}
        {...props}
      />
    </TextContext.Provider>
  );
});

const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function CardContent(props, ref) {
    const { content } = useRecipe(cardRecipe);
    return (
      <div
        ref={ref}
        {...content}
        {...props}
      />
    );
  },
);

const Footer = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardFooter(props, ref) {
  const { footer } = useRecipe(cardRecipe);
  return (
    <div
      ref={ref}
      {...footer}
      {...props}
    />
  );
});

export interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  alignment?: CardVariantProps['alignment'];
}

export function Card({ alignment, children, ...props }: CardProps) {
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
