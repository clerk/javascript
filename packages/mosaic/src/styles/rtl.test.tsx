import * as stylex from '@stylexjs/stylex';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from '../components/icon';
import { rtl } from './rtl.styles';

// StyleX generates the same atom for the same property+value across separate `create` calls, so a
// local probe names the atom to assert on without hardcoding a hash that a StyleX upgrade rewrites.
const probe = stylex.create({
  mirrored: { transform: { default: null, ':is([dir="rtl"] *)': 'scaleX(-1)' } },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => name && !name.includes('__'));

const mirrorAtom = atoms(probe.mirrored);

describe('Mosaic rtl styles', () => {
  it('mirrors on the horizontal axis only under an rtl ancestor', () => {
    expect(mirrorAtom).toHaveLength(1);
    expect(atoms(rtl.mirror)).toEqual(mirrorAtom);
  });

  it('lands on an icon that composes it through xstyle', () => {
    const { container } = render(
      <Icon
        name='chevron-right'
        xstyle={rtl.mirror}
      />,
    );

    expect(container.querySelector('svg')).toHaveClass(...mirrorAtom);
  });
});
