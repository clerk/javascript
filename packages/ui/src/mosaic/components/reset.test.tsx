import * as stylex from '@stylexjs/stylex';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import { Heading } from './heading';
import { reset } from './reset.styles';

// StyleX generates the same atom for the same property+value across separate `create` calls, so a
// local probe names the atoms to assert on without hardcoding hashes that a StyleX upgrade rewrites.
const probe = stylex.create({
  borderBox: { boxSizing: 'border-box' },
  inheritedWeight: { fontWeight: 'inherit' },
});

const classes = (style: stylex.StyleXStyles) => (stylex.props(style).className ?? '').split(' ').filter(Boolean);
const atoms = (style: stylex.StyleXStyles) => classes(style).filter(name => !name.includes('__'));

// StyleX drops an atom once a component sets the same property, which is the whole point of the
// reset going first — so `margin`/`padding`/the `inherit` declarations cannot be asserted on. Two
// things do hold:
//   - `box-sizing`, the one property nothing overrides
//   - the `<file>__<key>` marker class, which survives every property-level override and is
//     therefore the actual proof that a component composed `reset.base` at all
const borderBoxAtom = atoms(probe.borderBox);
const resetMarker = classes(reset.base).filter(name => name.includes('__'));

describe('Mosaic reset', () => {
  it('lands on the root element of a component that composes it', () => {
    // Guards the assertion below from passing on an empty class list.
    expect(borderBoxAtom).toHaveLength(1);
    expect(resetMarker).toHaveLength(1);

    const { container } = render(<Button>Continue</Button>);

    expect(container.firstElementChild).toHaveClass(...resetMarker, ...borderBoxAtom);
  });

  it('lets a component win over the reset it composes first', () => {
    const { container } = render(<Heading>Title</Heading>);

    // `reset.base` sets `fontWeight: inherit`; `heading.styles` sets semibold after it, so StyleX
    // must have dropped the reset's atom. Order-dependent, which is why the reset always goes first.
    expect(container.firstElementChild).not.toHaveClass(...atoms(probe.inheritedWeight));
  });
});
