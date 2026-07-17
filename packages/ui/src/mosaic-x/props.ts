import type { CompiledStyles, InlineStyles, StyleXArray } from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';

// Mirrors the argument type of `stylex.props`. Deriving it via
// `Parameters<typeof stylex.props>` collapses to `never`, so we reference the
// public style types StyleX re-exports from its root.
type StyleArg = StyleXArray<(null | undefined | CompiledStyles) | boolean | Readonly<[CompiledStyles, InlineStyles]>>;

/**
 * Resolve a component's styling into spreadable `{ className, style }`.
 *
 * Folds three things into one call so components don't hand-roll the merge:
 *   1. `stable`    — the hand-authored targeting class (e.g. `cl-button`)
 *   2. `className` — the consumer's incoming className (may be undefined)
 *   3. `...styles` — the StyleX style objects to compose for this render
 *
 * Order is deliberate: stable → consumer → StyleX atoms. The atoms live in
 * `@layer priorityN`, so keeping the stable/consumer classes ahead of them is
 * cosmetic (layer order decides precedence), but it keeps the emitted class
 * list readable and predictable.
 *
 * Runtime note: `stylex.props` runs per render because variant selection
 * depends on props. That is inherent to StyleX, not to this helper.
 */
export function cx(stable: string, className: string | undefined, ...styles: StyleArg[]) {
  const atomic = stylex.props(...styles);
  return {
    className: [stable, className, atomic.className].filter(Boolean).join(' '),
    style: atomic.style,
  };
}
