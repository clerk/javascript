import { createTheme } from './createTheme';

/**
 * A theme that strips all Clerk visual styling down to bare structural layout.
 * Designed as a blank canvas for LLMs and AI-powered coding tools that generate
 * complete custom styles via the `elements` API.
 *
 * What it removes: colors, shadows, border-radius, shimmer, animations, decorative borders
 * What it keeps: flexbox/grid layout, positioning, spacing, visibility, state mechanics
 *
 * Most variables are irrelevant here because `__internal_rawMode` strips the CSS
 * properties that consume them. The exceptions are colors that feed CSS custom
 * properties surviving the strip (icon fills, gauge strokes).
 */
export const raw = createTheme({
  name: 'raw',
  // @ts-expect-error Internal API - skip the default clerkTheme decorative layer and enable raw mode
  simpleStyles: true,
  __internal_rawMode: true,
  variables: {
    // Icon fill: masked provider icons use --cl-icon-fill which survives stripping
    colorForeground: '#000000',
    colorPrimaryForeground: '#ffffff',
  },
  options: {
    shimmer: false,
    animations: false,
  },
});
