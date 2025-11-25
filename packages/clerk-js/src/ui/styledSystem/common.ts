import { colors } from '../utils/colors';
import { clerkCssVar } from '../utils/cssVariables';
import type { InternalTheme } from './types';

const textVariants = (t: InternalTheme) => {
  const base = {
    fontFamily: 'inherit',
    letterSpacing: t.letterSpacings.$normal,
  };

  const h1 = {
    ...base,
    fontWeight: t.fontWeights.$semibold,
    fontSize: t.fontSizes.$xl,
    lineHeight: t.lineHeights.$extraSmall,
  } as const;

  const h2 = {
    ...base,
    fontWeight: t.fontWeights.$bold,
    fontSize: t.fontSizes.$lg,
    lineHeight: t.lineHeights.$medium,
  } as const;

  const h3 = {
    ...base,
    fontWeight: t.fontWeights.$bold,
    fontSize: t.fontSizes.$md,
    lineHeight: t.lineHeights.$small,
  } as const;

  const subtitle = {
    ...base,
    fontWeight: t.fontWeights.$medium,
    fontSize: t.fontSizes.$md,
    lineHeight: t.lineHeights.$small,
  } as const;

  const body = {
    ...base,
    fontWeight: t.fontWeights.$normal,
    fontSize: t.fontSizes.$md,
    lineHeight: t.lineHeights.$small,
  } as const;

  const caption = {
    ...base,
    fontWeight: t.fontWeights.$medium,
    fontSize: t.fontSizes.$xs,
    lineHeight: t.lineHeights.$large,
  } as const;

  const buttonLarge = {
    ...base,
    fontWeight: t.fontWeights.$medium,
    fontSize: t.fontSizes.$md,
    lineHeight: t.lineHeights.$small,
    fontFamily: t.fonts.$buttons,
  } as const;

  const buttonSmall = {
    ...base,
    fontWeight: t.fontWeights.$medium,
    fontSize: t.fontSizes.$sm,
    lineHeight: t.lineHeights.$extraSmall,
    fontFamily: t.fonts.$buttons,
  } as const;

  return {
    h1,
    h2,
    h3,
    subtitle,
    body,
    caption,
    buttonLarge,
    buttonSmall,
  } as const;
};

const borderVariants = (t: InternalTheme, props?: any) => {
  const hoverBorderColor = !props?.hasError ? t.colors.$borderAlpha300 : t.colors.$dangerAlpha500;
  const hoverBoxShadow = t.shadows.$input.replace(
    '{{color}}',
    !props?.hasError ? t.colors.$borderAlpha150 : t.colors.$dangerAlpha200,
  );
  const hoverStyles =
    props?.hoverStyles === false
      ? {}
      : {
          '&:hover': {
            WebkitTapHighlightColor: 'transparent',
            borderColor: hoverBorderColor,
            boxShadow: hoverBoxShadow,
          },
        };
  const focusStyles =
    props?.focusRing === false
      ? {}
      : {
          '&:focus': {
            borderColor: hoverBorderColor,
            WebkitTapHighlightColor: 'transparent',
            boxShadow: [
              hoverBoxShadow,
              t.shadows.$focusRing.replace(
                '{{color}}',
                !props?.hasError ? t.colors.$borderAlpha150 : (t.colors.$dangerAlpha200 as string),
              ),
            ].toString(),
          },
        };

  const borderColor = !props?.hasError
    ? !props?.hasWarning
      ? t.colors.$borderAlpha150 // Default border color
      : t.colors.$warningAlpha300 // Warning border color
    : t.colors.$dangerAlpha500; // Error border color

  const boxShadow = !props?.hasError
    ? !props?.hasWarning
      ? t.colors.$borderAlpha100 // Default box shadow color
      : t.colors.$warningAlpha50 // Warning box shadow color
    : t.colors.$borderAlpha150; // Error box shadow color

  return {
    normal: {
      borderRadius: t.radii.$md,
      borderWidth: t.borderWidths.$normal,
      borderStyle: t.borderStyles.$solid,
      borderColor,
      boxShadow: t.shadows.$input.replace('{{color}}', boxShadow),
      transitionProperty: t.transitionProperty.$common,
      transitionTimingFunction: t.transitionTiming.$common,
      transitionDuration: t.transitionDuration.$focusRing,
      ...hoverStyles,
      ...focusStyles,
    },
  } as const;
};

const borderColor = (t: InternalTheme, props?: any) => {
  return {
    borderColor: props?.hasError ? t.colors.$dangerAlpha500 : t.colors.$borderAlpha150,
  } as const;
};

const focusRingStyles = (t: InternalTheme) => {
  return {
    '&::-moz-focus-inner': { border: '0' },
    WebkitTapHighlightColor: 'transparent',
    boxShadow: t.shadows.$focusRing.replace('{{color}}', t.colors.$colorRing),
    transitionProperty: t.transitionProperty.$common,
    transitionTimingFunction: t.transitionTiming.$common,
    transitionDuration: t.transitionDuration.$focusRing,
  } as const;
};

const focusRing = (t: InternalTheme) => {
  return {
    '&:focus': {
      ...focusRingStyles(t),
    },
  } as const;
};

const disabled = (t: InternalTheme) => {
  return {
    '&:disabled,&[data-disabled]': {
      cursor: 'not-allowed',
      pointerEvents: 'none',
      opacity: t.opacity.$disabled,
    },
  } as const;
};

const centeredFlex = (display: 'flex' | 'inline-flex' = 'flex') => ({
  display: display,
  justifyContent: 'center',
  alignItems: 'center',
});

const unstyledScrollbar = (t: InternalTheme) => ({
  '::-webkit-scrollbar': {
    background: 'transparent',
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-thumb': {
    background: t.colors.$neutralAlpha500,
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
});

const maxHeightScroller = (t: InternalTheme) =>
  ({
    height: '100%',
    overflowY: 'auto',
    ...unstyledScrollbar(t),
  }) as const;

const mergedColorsBackground = (colorBack: string, colorFront: string) => {
  return `linear-gradient(${colorFront},${colorFront}), linear-gradient(${colorBack}, ${colorBack})`;
};

const mutedBackground = (t: InternalTheme) => {
  const defaultColor =
    t.colors.$colorMuted ||
    mergedColorsBackground(colors.setAlpha(t.colors.$colorBackground, 1), t.colors.$neutralAlpha50);
  return clerkCssVar('color-muted', defaultColor);
};

const visuallyHidden = () =>
  ({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  }) as const;

export const common = {
  textVariants,
  borderVariants,
  focusRingStyles,
  focusRing,
  disabled,
  borderColor,
  centeredFlex,
  maxHeightScroller,
  mutedBackground,
  unstyledScrollbar,
  mergedColorsBackground,
  visuallyHidden,
};
