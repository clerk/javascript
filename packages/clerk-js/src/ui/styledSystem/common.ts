import type { InternalTheme } from './types';

const textVariants = (t: InternalTheme) => {
  const base = {
    WebkitFontSmoothing: t.options.$fontSmoothing,
    fontFamily: 'inherit',
  };

  const smallRegular = {
    ...base,
    fontWeight: t.fontWeights.$normal,
    fontSize: t.fontSizes.$xs,
    lineHeight: t.lineHeights.$shorter,
  } as const;

  const smallMedium = {
    ...smallRegular,
    fontWeight: t.fontWeights.$medium,
    lineHeight: t.lineHeights.$short,
  } as const;

  const smallBold = {
    ...smallMedium,
    fontWeight: t.fontWeights.$bold,
  } as const;

  const extraSmallRegular = {
    ...base,
    fontWeight: t.fontWeights.$normal,
    fontSize: t.fontSizes.$2xs,
    letterSpacing: t.letterSpacings.$normal,
    lineHeight: t.lineHeights.$none,
  } as const;

  const regularRegular = {
    ...base,
    fontWeight: t.fontWeights.$normal,
    fontSize: t.fontSizes.$sm,
    lineHeight: t.lineHeights.$shorter,
  } as const;

  const regularMedium = {
    ...regularRegular,
    fontWeight: t.fontWeights.$medium,
  } as const;

  const largeBold = {
    ...base,
    fontWeight: t.fontWeights.$bold,
    fontSize: t.fontSizes.$md,
    lineHeight: t.lineHeights.$taller,
  } as const;

  const largeMedium = {
    ...largeBold,
    fontWeight: t.fontWeights.$medium,
  };

  const xlargeMedium = {
    ...largeBold,
    fontSize: t.fontSizes.$xl,
  } as const;

  const xxlargeMedium = {
    ...xlargeMedium,
    fontSize: t.fontSizes.$2xl,
  } as const;

  const buttonExtraSmallBold = {
    ...extraSmallRegular,
    fontWeight: t.fontWeights.$bold,
    textTransform: 'uppercase',
    fontFamily: t.fonts.$buttons,
  } as const;

  const buttonSmallRegular = {
    ...smallRegular,
    fontFamily: t.fonts.$buttons,
  };

  const buttonRegularRegular = {
    ...regularRegular,
    fontFamily: t.fonts.$buttons,
    lineHeight: t.lineHeights.$none,
  };

  const buttonRegularMedium = {
    ...regularMedium,
    fontFamily: t.fonts.$buttons,
    lineHeight: t.lineHeights.$none,
  };

  const headingRegularRegular = {
    ...regularRegular,
    fontSize: t.fontSizes.$md,
  } as const;

  return {
    headingRegularRegular,
    buttonExtraSmallBold,
    buttonSmallRegular,
    buttonRegularRegular,
    buttonRegularMedium,
    extraSmallRegular,
    smallRegular,
    smallMedium,
    smallBold,
    regularRegular,
    regularMedium,
    largeMedium,
    largeBold,
    xlargeMedium,
    xxlargeMedium,
  } as const;
};

const fontSizeVariants = (t: InternalTheme) => {
  return {
    xss: { fontSize: t.fontSizes.$2xs },
    xs: { fontSize: t.fontSizes.$xs },
    sm: { fontSize: t.fontSizes.$sm },
  } as const;
};

const borderVariants = (t: InternalTheme, props?: any) => {
  return {
    normal: {
      borderRadius: t.radii.$md,
      border: t.borders.$normal,
      ...borderColor(t, props),
    },
  } as const;
};

const borderColor = (t: InternalTheme, props?: any) => {
  return {
    borderColor: props?.hasError
      ? t.colors.$danger500
      : props?.isSuccessful
      ? t.colors.$success500
      : t.colors.$blackAlpha300,
  } as const;
};

const focusRing = (t: InternalTheme) => {
  return {
    '&:focus': {
      '&::-moz-focus-inner': { border: '0' },
      WebkitTapHighlightColor: 'transparent',
      boxShadow: t.shadows.$focusRing.replace('{{color}}', t.colors.$primary200),
      transitionProperty: t.transitionProperty.$common,
      transitionTimingFunction: t.transitionTiming.$common,
      transitionDuration: t.transitionDuration.$focusRing,
    },
  } as const;
};

const focusRingInput = (t: InternalTheme, props?: any) => {
  return {
    '&:focus': {
      WebkitTapHighlightColor: 'transparent',
      boxShadow: t.shadows.$focusRingInput.replace(
        '{{color}}',
        props?.hasError ? t.colors.$danger200 : props?.isSuccessful ? t.colors.$success200 : t.colors.$primary200,
      ),
      transitionProperty: t.transitionProperty.$common,
      transitionTimingFunction: t.transitionTiming.$common,
      transitionDuration: t.transitionDuration.$focusRing,
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
    background: t.colors.$blackAlpha500,
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
});

const maxHeightScroller = (t: InternalTheme) =>
  ({
    height: '100%',
    overflowY: 'scroll',
    ...unstyledScrollbar(t),
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
  unstyledScrollbar,
};
