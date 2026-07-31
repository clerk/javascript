import { describe, expect, it } from 'vitest';

import { scrollbarVars, scrollFadeVars } from '../../tokens.stylex';
import { scrollAreaRoot, scrollAreaViewport } from './scroll-area.styles';
import { scrollAreaVars } from './scroll-area.vars.stylex';

describe('Mosaic scroll area styles', () => {
  it('composes the viewport atoms into one spreadable set', () => {
    expect(scrollAreaViewport()).toHaveLength(5);
    expect(scrollAreaRoot).toBeDefined();
  });

  // The atoms carry the gutter, so the two have to be distinguishable — an accidental
  // collapse would silently give every scroll surface the same overflow behaviour.
  it('varies the gutter atom by argument', () => {
    expect(scrollAreaViewport('stable')).not.toEqual(scrollAreaViewport('auto'));
  });

  it('defaults the gutter to auto', () => {
    expect(scrollAreaViewport()).toEqual(scrollAreaViewport('auto'));
  });

  // The `--cl-*` names are the public API — a consumer's stylesheet references them by hand,
  // and `clerk-js` ships to apps pinned to older SDKs, so renaming one breaks themes already
  // in the wild. Assert the exact strings so a rename has to be a deliberate act.
  //
  // `toMatchObject`, not `toEqual`: StyleX adds an internal `__varGroupHash__` key, and adding
  // a var is not itself breaking — removing or renaming one is.
  it('emits the documented per-element progress properties', () => {
    expect(scrollAreaVars).toMatchObject({
      '--cl-scroll-area-progress-start': 'var(--cl-scroll-area-progress-start)',
      '--cl-scroll-area-progress-end': 'var(--cl-scroll-area-progress-end)',
    });
  });

  it('reads the shared scroll tokens', () => {
    expect(scrollbarVars).toMatchObject({ '--cl-scrollbar-width': 'var(--cl-scrollbar-width)' });
    expect(scrollFadeVars).toMatchObject({
      '--cl-scroll-fade-size': 'var(--cl-scroll-fade-size)',
      '--cl-scroll-fade-range': 'var(--cl-scroll-fade-range)',
      '--cl-scroll-fade-inset': 'var(--cl-scroll-fade-inset)',
    });
  });
});
