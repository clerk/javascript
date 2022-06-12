import { InternalTheme } from './types';

const textVariants = (theme: InternalTheme) => {
  const textSmallRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$xs,
    lineHeight: theme.lineHeights.$base,
  } as const;

  const textSmallMedium = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$medium,
    fontSize: theme.fontSizes.$xs,
    lineHeight: theme.lineHeights.$base,
  } as const;

  const textButtonSmall = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$semibold,
    fontSize: theme.fontSizes.$xxs,
    letterSpacing: theme.space.$xxs,
    lineHeight: theme.lineHeights.$base,
    textTransform: 'uppercase',
  } as const;

  const textRegularRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$sm,
    lineHeight: theme.lineHeights.$shorter,
  } as const;

  const textXLargeMedium = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$semibold,
    fontSize: theme.fontSizes.$xl,
    lineHeight: theme.lineHeights.$taller,
  } as const;

  return {
    label: textSmallMedium,
    error: textSmallRegular,
    link: textSmallRegular,
    hint: textSmallRegular,
    input: textSmallRegular,
    buttonLabel: textButtonSmall,
    subheading: textRegularRegular,
    largeInput: textXLargeMedium,
  } as const;
};

const fontSizeVariants = (theme: InternalTheme) => {
  return {
    xss: { fontSize: theme.fontSizes.$xxs },
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

export const common = {
  textVariants,
  fontSizeVariants,
  borderVariants,
  focusRing,
  focusRingInput,
  disabled,
  borderColor,
};
