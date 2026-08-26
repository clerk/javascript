import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// The fill is a 4% tint of the semantic token rather than that token's `-faded` surface, so a
// banner composites over whatever it sits on and inverts with the token in dark mode. Each mix
// must be its own local binding — StyleX inlines the literal, and neither an imported constant
// nor a local helper call passes `valid-styles`.
const neutralFill = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`;
const warningFill = `color-mix(in oklab, ${colorVars['--cl-color-warning']} 4%, transparent)`;
const negativeFill = `color-mix(in oklab, ${colorVars['--cl-color-negative']} 4%, transparent)`;
const warningBorder = `color-mix(in oklab, ${colorVars['--cl-color-warning']} 20%, transparent)`;
const negativeBorder = `color-mix(in oklab, ${colorVars['--cl-color-negative']} 20%, transparent)`;

export const styles = stylex.create({
  root: {
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: space['1.5'],
    paddingBlock: space['1.5'],
    paddingInline: space['3'],
    alignItems: 'flex-start',
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  // `1lh` resolves against the root's line height, which centres the glyph on the label's first
  // line rather than on the whole stack.
  icon: {
    flexShrink: 0,
    height: '1lh',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  label: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  description: {
    margin: 0,
    textWrap: 'pretty',
  },
});

// Each colour names its own fill, border, and label colour; the label inherits the root's `color`.
// Neutral borrows `--cl-color-border` because that token exists for exactly this hairline — a tint
// of `--cl-color-neutral` strong enough to read as a border is far darker than the rest of Mosaic's
// dividers.
export const rootColors = stylex.create({
  neutral: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: neutralFill,
    color: colorVars['--cl-color-neutral-foreground'],
  },
  warning: {
    borderColor: warningBorder,
    backgroundColor: warningFill,
    color: colorVars['--cl-color-warning'],
  },
  negative: {
    borderColor: negativeBorder,
    backgroundColor: negativeFill,
    color: colorVars['--cl-color-negative'],
  },
});

// Neutral drops to the faded gray so the copy sits under its label; the saturated colours already
// read as supporting text at regular weight, so they stay on the label's colour.
export const descriptionColors = stylex.create({
  neutral: { color: colorVars['--cl-color-neutral-faded'] },
  warning: { color: colorVars['--cl-color-warning'] },
  negative: { color: colorVars['--cl-color-negative'] },
});
