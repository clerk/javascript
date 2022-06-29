import { InternalTheme } from './types';

const textVariants = (theme: InternalTheme) => {
  const textSmallRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$xs,
    lineHeight: theme.lineHeights.$none,
    fontFamily: theme.fonts.$main,
  } as const;

  const textSmallMedium = {
    ...textSmallRegular,
    fontWeight: theme.fontWeights.$medium,
    lineHeight: theme.lineHeights.$base,
  } as const;

  const textExtraSmallRegular = {
    fontWeight: theme.fontWeights.$normal,
    fontStyle: theme.fontStyles.$normal,
    fontSize: theme.fontSizes.$2xs,
    letterSpacing: theme.letterSpacings.$normal,
    lineHeight: theme.lineHeights.$none,
    fontFamily: theme.fonts.$main,
  } as const;

  const textButtonSmall = {
    ...textExtraSmallRegular,
    fontWeight: theme.fontWeights.$semibold,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.$buttons,
  } as const;

  const textExtraSmallMedium = {
    ...textButtonSmall,
    fontFamily: theme.fonts.$main,
  } as const;

  const textRegularRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$sm,
    lineHeight: theme.lineHeights.$shorter,
    fontFamily: theme.fonts.$main,
  } as const;

  const textRegularMedium = {
    ...textRegularRegular,
    fontWeight: theme.fontWeights.$medium,
  } as const;

  const textLargeSemibold = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$semibold,
    fontSize: theme.fontSizes.$md,
    lineHeight: theme.lineHeights.$taller,
    fontFamily: theme.fonts.$main,
  } as const;

  return {
    textSmallRegular,
    textSmallMedium,
    textButtonSmall,
    textRegularRegular,
    textLargeSemibold,
    textXLargeMedium,
    textRegularMedium,
    textExtraSmallMedium,
    textExtraSmallRegular,
    textLargeMedium,
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

export const common = {
  textVariants,
  fontSizeVariants,
  borderVariants,
  focusRing,
  focusRingInput,
  disabled,
  borderColor,
  centeredFlex,
};
