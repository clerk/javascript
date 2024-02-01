import type { Appearance } from '@clerk/types';

import type { InternalTheme } from './foundations';

export const defaultAppearance: Appearance = {
  elements: ({ theme }: { theme: InternalTheme }) => {
    return {
      button: {
        '&[data-variant="primary"]': {
          '&:hover': {
            backgroundColor: theme.colors.$primary500,
          },
          '&:focus': {
            backgroundColor: theme.colors.$primary500,
          },
          ':after': {
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
          ':hover::after': {
            opacity: 0,
          },
          ':active::after': {
            opacity: 1,
          },
        },
      },
    };
  },
};
