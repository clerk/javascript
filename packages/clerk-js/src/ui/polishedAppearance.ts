import type { Appearance } from '@clerk/types';

import type { InternalTheme } from './foundations';

const BORDER_SHADOW_LENGTH = '0px 0px 0px 1px';
const BUTTON_SOLID_SHADOW = (color: string) =>
  `${BORDER_SHADOW_LENGTH} ${color}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)`;

const cardContentStyles = (theme: InternalTheme) => ({
  border: 0,
  boxShadow: `${theme.shadows.$cardContentShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha50}`,
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
    '&:focus': {
      boxShadow: [hoverShadow, theme.shadows.$focusRing.replace('{{color}}', colors.focus)].toString(),
    },
  };
};

const inputStyles = (theme: InternalTheme) => ({
  border: 0,
  ...inputShadowStyles(theme, {
    idle1: theme.colors.$neutralAlpha150,
    idle2: theme.colors.$neutralAlpha100,
    hover1: theme.colors.$neutralAlpha300,
    hover2: theme.colors.$neutralAlpha150,
    focus: theme.colors.$neutralAlpha150,
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

export const polishedAppearance = {
  elements: ({ theme }: { theme: InternalTheme }) => {
    return {
      button: {
        '&[data-variant="solid"]': {
          border: 0,
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
          },
          '&[data-color="danger"]': {
            boxShadow: BUTTON_SOLID_SHADOW(theme.colors.$danger500),
          },
        },
        '&[data-variant="outline"]': {
          border: 0,
          boxShadow: `0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02), 0px 0px 0px 1px ${theme.colors.$neutralAlpha100}`,
        },
      },
      badge: {
        border: 0,
        margin: '1px',
        '&[data-color="primary"]': {
          boxShadow: `${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha150}, ${theme.shadows.$badge}`,
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
        ...inputStyles(theme),
        '&[type="radio"]': {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
      selectSearchInput: { margin: '4px' },
      phoneInputBox: (() => {
        const boxShadow = [
          `0px 0px 0px 1px ${theme.colors.$neutralAlpha150}`,
          theme.shadows.$input.replace('{{color}}', theme.colors.$neutralAlpha100),
        ].toString();
        return {
          border: 0,
          '> div > input': {
            boxShadow: 'unset',
          },
          boxShadow,
          '&:hover': { boxShadow },
          '&:focus': { boxShadow },
        };
      })(),
      cardBox: {
        border: 0,
        boxShadow: `${theme.shadows.$cardBoxShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha100}`,
      },
      card: {
        ...cardContentStyles(theme),
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
        border: 0,
        boxShadow: `${theme.shadows.$menuShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha100}`,
      },
      actionCard: {
        border: 0,
        boxShadow: `${theme.shadows.$actionCardShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha100}`,
      },
    };
  },
} satisfies Appearance;
