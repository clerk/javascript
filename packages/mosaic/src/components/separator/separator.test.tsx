import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Separator } from './separator';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Separator', () => {
  it('renders a plain separator without children', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('cl-separator');
    expect(separator).not.toHaveAttribute('data-labelled');
    expect(separator).toBeEmptyDOMElement();
  });

  it('renders a labelled separator with children', () => {
    render(<Separator>or</Separator>);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveTextContent('or');
    expect(separator).toHaveAttribute('data-labelled', '');
  });

  it.each([
    ['null', null],
    ['false', false],
    ['an empty string', ''],
  ])('renders the plain separator when children is %s', (_, children) => {
    render(<Separator>{children}</Separator>);
    expect(screen.getByRole('separator')).not.toHaveAttribute('data-labelled');
  });

  it('merges xstyle atoms after the slot atoms', () => {
    render(<Separator xstyle={atoms.spaced} />);
    expect(screen.getByRole('separator')).toHaveClass('cl-separator', stylex.props(atoms.spaced).className ?? '');
  });

  it('renders a custom element via render, keeping the styling contract', () => {
    render(<Separator render={<section />}>or</Separator>);
    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('SECTION');
    expect(separator).toHaveClass('cl-separator');
    expect(separator).toHaveAttribute('data-labelled', '');
  });

  it('forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('separator'));
  });
});
