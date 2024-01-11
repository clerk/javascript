import type { InternalTheme } from './types';

const textVariants = (t: InternalTheme) => {
  const base = {
    WebkitFontSmoothing: t.options.$fontSmoothing,
    fontFamily: 'inherit',
    letterSpacing: t.letterSpacings.$normal,
  };

  const h1 = {
    ...base,
    fontWeight: t.fontWeights.$medium,
    fontSize: t.fontSizes.$xl,
    lineHeight: t.lineHeights.$large,
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
    lineHeight: t.lineHeights.$none,
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
    lineHeight: t.lineHeights.$none,
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
  const defaultBoxShadow = t.shadows.$input.replace(
    '{{color}}',
    !props?.hasError ? t.colors.$blackAlpha200 : t.colors.$danger300,
  );
  const hoverBorderColor = !props?.hasError ? t.colors.$primary300 : t.colors.$danger400;
  const hoverStyles = {
    '&:hover': {
      WebkitTapHighlightColor: 'transparent',
      borderColor: hoverBorderColor,
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
              defaultBoxShadow,
              t.shadows.$focusRing.replace('{{color}}', props?.hasError ? t.colors.$danger200 : t.colors.$primary50),
            ].toString(),
          },
        };
  return {
    normal: {
      borderRadius: t.radii.$md,
      border: t.borders.$normal,
      borderColor: !props?.hasError ? t.colors.$blackAlpha300 : t.colors.$danger300,
      boxShadow: defaultBoxShadow,
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
    borderColor: props?.hasError ? t.colors.$danger500 : t.colors.$blackAlpha300,
  } as const;
};

const focusRing = (t: InternalTheme) => {
  return {
    '&:focus': {
      '&::-moz-focus-inner': { border: '0' },
      WebkitTapHighlightColor: 'transparent',
      boxShadow: t.shadows.$focusRing.replace('{{color}}', t.colors.$primary50),
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
      boxShadow: t.shadows.$focusRing.replace(
        '{{color}}',
        props?.hasError ? t.colors.$danger400 : t.colors.$primary400,
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
    overflowY: 'auto',
    ...unstyledScrollbar(t),
  } as const);

export const common = {
  textVariants,
  borderVariants,
  focusRing,
  focusRingInput,
  disabled,
  borderColor,
  centeredFlex,
  maxHeightScroller,
  unstyledScrollbar,
};
