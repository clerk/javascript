import { InternalTheme } from './types';

const textVariants = (theme: InternalTheme) => {
  const smallRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$xs,
    lineHeight: theme.lineHeights.$shorter,
    fontFamily: theme.fonts.$main,
  } as const;

  const smallMedium = {
    ...smallRegular,
    fontWeight: theme.fontWeights.$medium,
    lineHeight: theme.lineHeights.$short,
  } as const;

  const smallSemibold = {
    ...smallMedium,
    fontWeight: theme.fontWeights.$semibold,
  } as const;

  const extraSmallRegular = {
    fontWeight: theme.fontWeights.$normal,
    fontStyle: theme.fontStyles.$normal,
    fontSize: theme.fontSizes.$2xs,
    letterSpacing: theme.letterSpacings.$normal,
    lineHeight: theme.lineHeights.$none,
    fontFamily: theme.fonts.$main,
  } as const;

  const buttonSmall = {
    ...extraSmallRegular,
    fontWeight: theme.fontWeights.$semibold,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.$buttons,
  } as const;

  const extraSmallMedium = {
    ...buttonSmall,
    fontFamily: theme.fonts.$main,
    textTransform: 'none',
  } as const;

  const regularRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$sm,
    lineHeight: theme.lineHeights.$shorter,
    fontFamily: theme.fonts.$main,
  } as const;

  const regularMedium = {
    ...regularRegular,
    fontWeight: theme.fontWeights.$medium,
  } as const;

  const largeSemibold = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$semibold,
    fontSize: theme.fontSizes.$md,
    lineHeight: theme.lineHeights.$taller,
    fontFamily: theme.fonts.$main,
  } as const;

  const largeMedium = {
    ...largeSemibold,
    fontWeight: theme.fontWeights.$medium,
  };

  const xlargeMedium = {
    ...largeSemibold,
    fontSize: theme.fontSizes.$xl,
  } as const;

  const xxlargeMedium = {
    ...xlargeMedium,
    fontSize: theme.fontSizes.$2xl,
  } as const;

  return {
    buttonSmall,
    extraSmallRegular,
    extraSmallMedium,
    smallRegular,
    smallMedium,
    smallSemibold,
    regularRegular,
    regularMedium,
    largeMedium,
    largeSemibold,
    xlargeMedium,
    xxlargeMedium,
  } as const;
};

const fontSizeVariants = (theme: InternalTheme) => {
  return {
    xss: { fontSize: theme.fontSizes.$2xs },
    xs: { fontSize: theme.fontSizes.$xs },
    sm: { fontSize: theme.fontSizes.$sm },
  } as const;
};

const borderVariants = (theme: InternalTheme, props?: any) => {
  return {
    normal: {
      borderRadius: theme.radii.$md,
      border: theme.borders.$normal,
      ...borderColor(theme, props),
    },
  } as const;
};

const borderColor = (theme: InternalTheme, props?: any) => {
  return {
    borderColor: props?.hasError ? theme.colors.$danger500 : theme.colors.$blackAlpha300,
  } as const;
};

const focusRing = (theme: InternalTheme) => {
  return {
    '&:focus': {
      '&::-moz-focus-inner': { border: '0' },
      WebkitTapHighlightColor: 'transparent',
      outline: 'none',
      outlineOffset: '0',
      boxShadow: theme.shadows.$focusRing.replace('{{color}}', theme.colors.$primary200),
      transitionProperty: theme.transitionProperty.$common,
      transitionTimingFunction: theme.transitionTiming.$common,
      transitionDuration: theme.transitionDuration.$focusRing,
    },
  } as const;
};

const focusRingInput = (theme: InternalTheme) => {
  return {
    '&:focus': {
      WebkitTapHighlightColor: 'transparent',
      outlineOffset: '2',
      boxShadow: theme.shadows.$focusRingInput.replace('{{color}}', theme.colors.$primary200),
      transitionProperty: theme.transitionProperty.$common,
      transitionTimingFunction: theme.transitionTiming.$common,
      transitionDuration: theme.transitionDuration.$focusRing,
      borderColor: theme.colors.$primary200,
    },
  } as const;
};

const disabled = (theme: InternalTheme) => {
  return {
    '&:disabled,&[data-disabled]': {
      cursor: 'not-allowed',
      pointerEvents: 'none',
      opacity: theme.opacity.$disabled,
    },
  } as const;
};

const centeredFlex = (display: 'flex' | 'inline-flex' = 'flex') => ({
  display: display,
  justifyContent: 'center',
  alignItems: 'center',
});

const maxHeightScroller = theme =>
  ({
    height: '100%',
    overflowY: 'auto',
    '::-webkit-scrollbar': {
      background: 'transparent',
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.colors.$blackAlpha500,
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  } as const);

export const common = {
  textVariants,
  fontSizeVariants,
  borderVariants,
  focusRing,
  focusRingInput,
  disabled,
  borderColor,
  centeredFlex,
  maxHeightScroller,
};
