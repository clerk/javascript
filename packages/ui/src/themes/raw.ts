import { createTheme } from './createTheme';

/**
 * A theme that strips all Clerk visual styling down to bare structural layout.
 * Designed as a blank canvas for LLMs and AI-powered coding tools that generate
 * complete custom styles via the `elements` API.
 *
 * What it removes: colors, shadows, border-radius, shimmer, animations, decorative borders
 * What it keeps: flexbox/grid layout, positioning, spacing, visibility, state mechanics
 */
export const raw = createTheme({
  name: 'raw',
  // @ts-expect-error Internal API - skip the default clerkTheme decorative layer and enable raw mode
  simpleStyles: true,
  __internal_rawMode: true,
  variables: {
    // Backgrounds: transparent so the page shows through
    colorBackground: 'transparent',
    colorInput: 'transparent',
    colorMuted: 'transparent',
    colorShimmer: 'transparent',

    // Text: black on transparent, plain and neutral
    colorForeground: '#000000',
    colorInputForeground: '#000000',
    colorMutedForeground: '#000000',
    colorPrimaryForeground: '#ffffff',

    // All semantic colors flattened to black (no color opinions)
    colorPrimary: '#000000',
    colorDanger: '#000000',
    colorSuccess: '#000000',
    colorWarning: '#000000',
    colorNeutral: '#000000',

    // Borders and shadows: invisible
    colorBorder: 'transparent',
    colorShadow: 'transparent',
    colorRing: 'transparent',
    colorModalBackdrop: 'transparent',

    // Typography: inherit from parent, browser-default size
    fontFamily: 'inherit',
    fontFamilyButtons: 'inherit',
    fontSize: '1rem',

    // Shape: no rounding
    borderRadius: '0',
  },
  options: {
    shimmer: false,
    animations: false,
  },
});
