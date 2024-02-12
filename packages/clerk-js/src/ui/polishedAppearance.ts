import type { Appearance } from '@clerk/types';

import type { InternalTheme } from './foundations';

const BORDER_SHADOW_LENGTH = '0px 0px 0px 1px';

const cardContentStyles = (theme: InternalTheme) => ({
  border: 0,
  boxShadow: `${theme.shadows.$cardContentShadow}, ${BORDER_SHADOW_LENGTH} ${theme.colors.$neutralAlpha50}`,
});

export const polishedAppearance = {
  elements: ({ theme }: { theme: InternalTheme }) => {
    return {
      button: {
        '&[data-variant="solid"]': {
          border: 0,
          '&:hover': null,
          '&:focus': null,
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
          boxShadow: `0px 0px 0px 1px ${theme.colors.$primary500}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)`,
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
