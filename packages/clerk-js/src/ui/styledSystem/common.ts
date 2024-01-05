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
  const defaultBoxShadow = shadows(t)
    .input.replace('{{color1}}', !props?.hasError ? t.colors.$blackAlpha200 : t.colors.$danger200)
    .replace('{{color2}}', !props?.hasError ? t.colors.$blackAlpha300 : t.colors.$danger300);
  const hoverBoxShadow = shadows(t)
    .inputHover.replace('{{color1}}', !props?.hasError ? t.colors.$blackAlpha300 : t.colors.$danger300)
    .replace('{{color2}}', !props?.hasError ? t.colors.$blackAlpha400 : t.colors.$danger400);
  const hoverStyles = {
    '&:hover': {
      WebkitTapHighlightColor: 'transparent',
      boxShadow: [defaultBoxShadow, hoverBoxShadow].toString(),
    },
  };
  const focusStyles =
    props?.focusRing === false
      ? {}
      : {
          '&:focus': {
            WebkitTapHighlightColor: 'transparent',
            boxShadow: [
              defaultBoxShadow,
              hoverBoxShadow,
              shadows(t).focusRing.replace('{{color}}', props?.hasError ? t.colors.$danger200 : t.colors.$primary50),
            ].toString(),
          },
        };
  return {
    normal: {
      borderRadius: t.radii.$md,
      border: 'none',
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
      boxShadow: shadows(t).focusRing.replace('{{color}}', t.colors.$primary50),
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
      boxShadow: shadows(t).focusRing.replace(
        '{{color}}',
        props?.hasError ? t.colors.$danger400 : t.colors.$primary400,
      ),
      transitionProperty: t.transitionProperty.$common,
      transitionTimingFunction: t.transitionTiming.$common,
      transitionDuration: t.transitionDuration.$focusRing,
    },
  } as const;
};

const buttonShadow = (t: InternalTheme) => {
  return { boxShadow: shadows(t).buttonShadow.replace('{{color}}', t.colors.$primary800) };
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

const shadows = (t: InternalTheme) => {
  return {
    menuShadow: t.shadows.$menuShadow.replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    fabShadow: t.shadows.$fabShadow.replace('{{blackAlpha300}}', t.colors.$blackAlpha300),
    buttonShadow: t.shadows.$buttonShadow
      .replace('{{blackAlpha100}}', t.colors.$blackAlpha100)
      .replace('{{blackAlpha300}}', t.colors.$blackAlpha300),
    cardRootShadow: t.shadows.$cardRootShadow.replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    cardContentShadow: t.shadows.$cardContentShadow.replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    actionCardShadow: t.shadows.$actionCardShadow.replace('{{blackAlpha150}}', t.colors.$blackAlpha150),
    actionCardDestructiveShadow: t.shadows.$actionCardDestructiveShadow.replace(
      '{{blackAlpha100}}',
      t.colors.$blackAlpha100,
    ),
    secondaryButtonShadow: t.shadows.$secondaryButtonShadow
      .replace('{{blackAlpha100}}', t.colors.$blackAlpha100)
      .replace('{{blackAlpha25}}', t.colors.$blackAlpha25)
      .replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    shadowShimmer: t.shadows.$shadowShimmer.replace('{{blackAlpha400}}', t.colors.$blackAlpha400),
    badge: t.shadows.$badge.replace('{{blackAlpha50}}', t.colors.$blackAlpha50),
    tableBodyShadow: t.shadows.$tableBodyShadow.replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    selectButtonShadow: t.shadows.$selectButtonShadow.replace('{{blackAlpha100}}', t.colors.$blackAlpha100),
    sm: t.shadows.$sm,
    input: t.shadows.$input,
    inputHover: t.shadows.$inputHover,
    focusRing: t.shadows.$focusRing,
  } as const;
};

export const common = {
  textVariants,
  borderVariants,
  focusRing,
  focusRingInput,
  buttonShadow,
  disabled,
  borderColor,
  centeredFlex,
  maxHeightScroller,
  unstyledScrollbar,
  shadows,
};
