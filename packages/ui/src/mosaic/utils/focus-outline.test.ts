import { describe, expect, it } from 'vitest';

import { colorVars, focusVars } from '../tokens.stylex';
import { focusOutline } from './focus-outline.styles';

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

  // Longhands, never the `outline` shorthand: StyleX ranks a longhand above a shorthand
  // regardless of argument order, so the ring survives a component or consumer style that
  // carries `outline: 'none'` — which is how a focusable row ships with no visible focus.
  it.each(['visible', 'within'] as const)('declares the %s ring as four longhands', key => {
    // StyleX compiles each property to `<property>-<hash>`, plus a debug key naming the atom.
    const properties = Object.keys(focusOutline[key])
      .map(name => name.split('-')[0])
      .filter(name => name.startsWith('outline'))
      .sort();

    expect(properties).toEqual(['outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth']);
  });

  // The two conditions are different selectors, so they must not collapse onto one atom —
  // a container would then ring whenever it was itself focused, and vice versa.
  it('keeps the element ring and the container ring distinct', () => {
    expect(focusOutline.visible).not.toEqual(focusOutline.within);
  });
});
