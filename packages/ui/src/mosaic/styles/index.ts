// StyleX-only barrel: the entry for the isolated `build:mosaic` tsdown config.
// It re-exports every migrated (Emotion-free) Mosaic component plus the tokens
// and helpers, so the StyleX rollup plugin can walk this graph and extract one
// static `styles.css`. Keep it isolated from Emotion/un-migrated code — grow it
// as components migrate.

export { Button } from '../components/button';
export type { ButtonProps } from '../components/button';

import { colorVars, radiusVars, space, spacingVars, typeScaleVars } from '../tokens.stylex';

export { colorVars, radiusVars, space, spacingVars, typeScaleVars };

// Derived here, not in `tokens.stylex.ts`: `@stylexjs/enforce-extension` requires a
// `.stylex.ts` file to export nothing but its `defineVars` results. The vars are keyed
// by the same `--cl-*` names, so `keyof typeof …Vars` reproduces each token union.
export type ColorVarName = keyof typeof colorVars;
export type RadiusVarName = keyof typeof radiusVars;
export type SpacingVarName = keyof typeof spacingVars;
export type TypeScaleVarName = keyof typeof typeScaleVars;
export { mergeProps, themeProps } from '../props';
