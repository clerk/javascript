import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field } from '../components/field';
import { VisuallyHidden } from '../components/visually-hidden';

// StyleX generates the same atom for the same property+value across separate `create` calls, so a
// local probe names the atom to assert on without hardcoding a hash that a StyleX upgrade rewrites.
const probe = stylex.create({
  clipped: { clip: 'rect(0, 0, 0, 0)' },
});

const clippedAtom = (stylex.props(probe.clipped).className ?? '')
  .split(' ')
  .filter(name => name && !name.includes('__'));

describe('Mosaic visually hidden', () => {
  it('lands on an element that composes it after the reset', () => {
    expect(clippedAtom).toHaveLength(1);

    render(<VisuallyHidden>Loading</VisuallyHidden>);

    expect(screen.getByText('Loading')).toHaveClass(...clippedAtom);
  });

  it('survives the field label style chain', () => {
    render(
      <Field.Root>
        <Field.Label visuallyHidden>Email</Field.Label>
      </Field.Root>,
    );

    expect(screen.getByText('Email')).toHaveClass(...clippedAtom);
  });
});
