import type { InternalTheme } from './foundations';
import type { Appearance, Elements } from './internal/appearance';

const BORDER_SHADOW_LENGTH = '0px 0px 0px 1px';
const BUTTON_SOLID_SHADOW = (color: string) =>
  `${BORDER_SHADOW_LENGTH} ${color}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)`;
const BUTTON_OUTLINE_SHADOW = (color: string) =>
  `${BORDER_SHADOW_LENGTH} ${color}, 0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02)`;

const cardContentStyles = (theme: InternalTheme) => ({
  borderWidth: 0,
  boxShadow: `${theme.shadows.$cardContentShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha50}`,
});

const inputShadowStyles = (
  theme: InternalTheme,
  colors: { idle1: string; idle2: string; hover1: string; hover2: string; focus: string },
) => {
  const idleShadow = [
    `0px 0px 0px 1px ${colors.idle1}`,
    theme.shadows.$input.replace('{{color}}', colors.idle2),
  ].toString();
  const hoverShadow = [
    `0px 0px 0px 1px ${colors.hover1}`,
    theme.shadows.$input.replace('{{color}}', colors.hover2),
  ].toString();

  return {
    boxShadow: idleShadow,
    '&:hover': {
      boxShadow: hoverShadow,
    },
    '&:focus-within,&[data-focus-within="true"]': {
      boxShadow: [hoverShadow, theme.shadows.$focusRing.replace('{{color}}', colors.focus)].toString(),
    },
  };
};

const checkboxShadowStyles = (
  theme: InternalTheme,
  colors: { idle1: string; idle2: string; hover1: string; hover2: string; focus: string },
) => {
  const idleShadow = [
    `0px 0px 0px 1px ${colors.idle1}`,
    theme.shadows.$input.replace('{{color}}', colors.idle2),
  ].toString();
  const hoverShadow = [
    `0px 0px 0px 1px ${colors.hover1}`,
    theme.shadows.$input.replace('{{color}}', colors.hover2),
  ].toString();

  return {
    boxShadow: idleShadow,
    '&:hover': {
      boxShadow: hoverShadow,
    },
    '&:focus-visible': {
      boxShadow: [hoverShadow, theme.shadows.$focusRing.replace('{{color}}', colors.focus)].toString(),
    },
  };
};

const inputStyles = (theme: InternalTheme) => ({
  borderWidth: 0,
  ...inputShadowStyles(theme, {
    idle1: theme.colors.$borderAlpha150,
    idle2: theme.colors.$borderAlpha100,
    hover1: theme.colors.$borderAlpha300,
    hover2: theme.colors.$borderAlpha150,
    focus: theme.colors.$colorRing,
  }),
  '&[data-feedback="error"]': inputShadowStyles(theme, {
    idle1: theme.colors.$dangerAlpha400,
    idle2: theme.colors.$dangerAlpha200,
    hover1: theme.colors.$dangerAlpha500,
    hover2: theme.colors.$dangerAlpha200,
    focus: theme.colors.$dangerAlpha200,
  }),
  '&[data-feedback="warning"]': inputShadowStyles(theme, {
    idle1: theme.colors.$warningAlpha400,
    idle2: theme.colors.$warningAlpha200,
    hover1: theme.colors.$warningAlpha500,
    hover2: theme.colors.$warningAlpha200,
    focus: theme.colors.$warningAlpha200,
  }),
  '&[data-feedback="success"]': inputShadowStyles(theme, {
    idle1: theme.colors.$successAlpha400,
    idle2: theme.colors.$successAlpha200,
    hover1: theme.colors.$successAlpha500,
    hover2: theme.colors.$successAlpha200,
    focus: theme.colors.$successAlpha200,
  }),
});

const clerkTheme: Appearance = {
  elements: ({ theme }: { theme: InternalTheme }): Elements => {
    return {
      button: {
        '&[data-variant="solid"]': {
          borderWidth: '0px',
          '&:after': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            opacity: 1,
            transitionProperty: theme.transitionProperty.$common,
            transitionDuration: theme.transitionDuration.$controls,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha150} 0%, ${theme.colors.$transparent} 100%)`,
          },
          '&:hover::after': {
            opacity: 0,
          },
          '&:active::after': {
            opacity: 1,
          },
          '&[data-color="primary"]': {
            boxShadow: BUTTON_SOLID_SHADOW(theme.colors.$primary500),
            '&:focus': {
              boxShadow: [
                BUTTON_SOLID_SHADOW(theme.colors.$primary500),
                theme.shadows.$focusRing.replace('{{color}}', theme.colors.$colorRing),
              ].toString(),
            },
          },
          '&[data-color="danger"]': {
            boxShadow: BUTTON_SOLID_SHADOW(theme.colors.$danger500),
            '&:focus': {
              boxShadow: [
                BUTTON_SOLID_SHADOW(theme.colors.$danger500),
                theme.shadows.$focusRing.replace('{{color}}', theme.colors.$dangerAlpha200),
              ].toString(),
            },
          },
        },
        '&[data-variant="outline"]': {
          borderWidth: 0,
          boxShadow: BUTTON_OUTLINE_SHADOW(theme.colors.$borderAlpha100),
          '&:focus': {
            boxShadow: [
              BUTTON_OUTLINE_SHADOW(theme.colors.$borderAlpha100),
              theme.shadows.$focusRing.replace('{{color}}', theme.colors.$colorRing),
            ].toString(),
          },
        },
        '&[data-variant="bordered"]': {
          borderWidth: 0,
          boxShadow: BUTTON_OUTLINE_SHADOW(theme.colors.$borderAlpha100),
          '&:focus': {
            boxShadow: [
              BUTTON_OUTLINE_SHADOW(theme.colors.$borderAlpha100),
              theme.shadows.$focusRing.replace('{{color}}', theme.colors.$colorRing),
            ].toString(),
          },
        },
      },
      badge: {
        borderWidth: 0,
        margin: '1px',
        '&[data-color="primary"]': {
          boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}, ${theme.shadows.$badge}`,
        },
        '&[data-color="danger"]': {
          boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$dangerAlpha300}, ${theme.shadows.$badge}`,
        },
        '&[data-color="success"]': {
          boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$successAlpha300}, ${theme.shadows.$badge}`,
        },
        '&[data-color="warning"]': {
          boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$warningAlpha300}, ${theme.shadows.$badge}`,
        },
      },
      input: {
        '&[data-variant="default"]': {
          ...inputStyles(theme),
        },
      },
      checkbox: {
        ...checkboxShadowStyles(theme, {
          idle1: theme.colors.$neutralAlpha150,
          idle2: theme.colors.$neutralAlpha100,
          hover1: theme.colors.$neutralAlpha300,
          hover2: theme.colors.$neutralAlpha150,
          focus: theme.colors.$neutralAlpha150,
        }),
        padding: theme.space.$1,
        width: theme.sizes.$3x5,
        height: theme.sizes.$3x5,
        appearance: 'none',
        borderRadius: theme.radii.$sm,
        border: 'none',
        backgroundSize: `${theme.sizes.$2} ${theme.sizes.$2}`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&:checked': {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 8 8'%3E%3Cpath fill='${theme.colors.$white}' fill-rule='evenodd' d='M7.712.233a.889.889 0 0 1 .055 1.256C6.742 2.61 6.249 3.291 5.508 4.615c-.279.5-.589 1.194-.835 1.784a36.761 36.761 0 0 0-.382.95l-.021.057-.006.014-.001.003a.89.89 0 0 1-1.504.27L.218 4.765A.889.889 0 1 1 1.56 3.6l1.591 1.834c.235-.548.524-1.181.806-1.685.807-1.445 1.38-2.239 2.499-3.46A.889.889 0 0 1 7.712.234Z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
          borderColor: theme.colors.$transparent,
          backgroundColor: theme.colors.$primary500,
        },
      },
      tagInputContainer: {
        ...inputStyles(theme),
      },
      tagPillContainer: {
        borderWidth: 0,
        boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}, ${theme.shadows.$badge}`,
      },
      phoneInputBox: {
        ...inputStyles(theme),
      },
      formInputGroup: {
        ...inputStyles(theme),
      },
      selectSearchInput__countryCode: {
        boxShadow: 'none',
        '&:focus': { boxShadow: 'none' },
      },
      cardBox: {
        borderWidth: 0,
        boxShadow: `${theme.shadows.$cardBoxShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
      },
      drawerContent: {
        borderWidth: 0,
        boxShadow: `${theme.shadows.$cardBoxShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
      },
      popoverBox: {
        borderWidth: 0,
        boxShadow: `${theme.shadows.$cardBoxShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
      },
      card: {
        ...cardContentStyles(theme),
      },
      pricingTableCard: {
        '&[data-variant="default"]': {
          borderWidth: 0,
          boxShadow: `${theme.shadows.$cardBoxShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
        },
        '&[data-variant="compact"]': {
          borderWidth: 0,
          boxShadow: `0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(25, 28, 33, 0.12), 0px 0px 0px 1px ${theme.colors.$borderAlpha100}`,
        },
      },
      scrollBox: {
        ...cardContentStyles(theme),
      },
      userButtonPopoverMain: {
        ...cardContentStyles(theme),
      },
      organizationSwitcherPopoverMain: {
        ...cardContentStyles(theme),
      },
      menuList: {
        borderWidth: 0,
        boxShadow: `${theme.shadows.$menuShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
      },
      actionCard: {
        borderWidth: 0,
        boxShadow: `${theme.shadows.$actionCardShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$borderAlpha100}`,
      },
      table: {
        borderWidth: 0,
        boxShadow: `0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(25, 28, 33, 0.12), 0px 0px 0px 1px ${theme.colors.$borderAlpha100}`,
      },
    };
  },
} satisfies Appearance;

const simpleTheme: Appearance = {
  // @ts-expect-error Internal API for simple theme detection
  simpleStyles: true,
  elements: {},
} satisfies Appearance;

export const getBaseTheme = (theme: 'clerk' | 'simple' = 'clerk'): Appearance => {
  switch (theme) {
    case 'simple':
      return simpleTheme;
    case 'clerk':
    default:
      return clerkTheme;
  }
};

export const baseTheme = clerkTheme;
