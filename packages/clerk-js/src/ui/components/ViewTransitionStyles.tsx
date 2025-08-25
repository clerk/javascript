import { css, Global } from '@emotion/react';

/**
 * Global CSS injection for View Transition API support
 * Provides smooth height transitions for all card components
 */
export const ViewTransitionStyles = () => {
  return (
    <Global
      styles={css`
        /* Universal card height transitions */
        @supports (view-transition-name: card-root) {
          ::view-transition-group(card-root) {
            animation-duration: 0.4s;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}
    />
  );
};
