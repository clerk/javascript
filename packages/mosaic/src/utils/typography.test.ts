import * as stylex from '@stylexjs/stylex';
import { describe, expect, it } from 'vitest';

import { tabularNumbersStyle } from './typography.styles';

// StyleX generates the same atom for the same property+value across separate `create` calls, so a
// local probe names the atom to assert on without hardcoding a hash that a StyleX upgrade rewrites.
const probe = stylex.create({
  tabular: { fontVariantNumeric: 'tabular-nums' },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => name && !name.includes('__'));

describe('Mosaic typography', () => {
  it('exposes tabular figures as their own style', () => {
    expect(atoms(probe.tabular)).toHaveLength(1);
    expect(atoms(tabularNumbersStyle.enabled)).toEqual(atoms(probe.tabular));
  });
});
