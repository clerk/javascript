import { describe, expect, it } from 'vitest';

import { colorVars, focusVars } from '../tokens.stylex';

describe('Mosaic focus outline', () => {
  // The `--cl-*` names are the public API — a consumer's stylesheet references them by hand,
  // and `clerk-js` ships to apps pinned to older SDKs, so renaming one breaks themes already
  // in the wild. Assert the exact strings so a rename has to be a deliberate act.
  it('emits the documented focus tokens', () => {
    expect(focusVars).toMatchObject({
      '--cl-focus-outline-width': 'var(--cl-focus-outline-width)',
      '--cl-focus-outline-style': 'var(--cl-focus-outline-style)',
      '--cl-focus-outline-offset': 'var(--cl-focus-outline-offset)',
    });
    expect(colorVars).toMatchObject({ '--cl-color-ring': 'var(--cl-color-ring)' });
  });

  // The colour has ONE public name. A `--cl-focus-outline-color` alias would let a consumer
  // override one and not the other, and the ring would then depend on which they picked.
  it('keeps the ring colour out of the focus token group', () => {
    expect(Object.keys(focusVars)).not.toContain('--cl-focus-outline-color');
  });
});
