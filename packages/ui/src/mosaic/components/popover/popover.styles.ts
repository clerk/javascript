import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  // Floating wrapper. Positioning styles are applied inline by the headless
  // positioner; this only owns stacking and clears the focus outline the
  // FloatingFocusManager places here.
  positioner: {
    outline: 'none',
    zIndex: 50,
  },

  // The popup card: the flexible container that holds content + footer.
  popup: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-container'],
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: 'none',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.98)',
    },
    transitionDuration: '150ms',
    // Enter/exit transition. The headless popup sets `data-starting-style` on the
    // entering frame and `data-ending-style` while exiting — both are the element's
    // OWN attributes. A bare `[data-*]` key is rejected by StyleX (conditional keys
    // must start with `:` or `@`), so wrap it in `:where(...)`, a valid pseudo-class
    // string that targets the same element. `stylex.when.*` covers ancestor/sibling
    // state; this covers self-state.
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: 'ease-out',
    maxWidth: 'calc(100vw - 2rem)',
    minWidth: '18rem',
  },

  // Flexible inner content region. Scrolls on overflow so tall content never
  // pushes the footer out of view.
  content: {
    padding: space['4'],
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
  },

  // Footer region, visually separated from content by a top border.
  footer: {
    padding: space['4'],
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
});
