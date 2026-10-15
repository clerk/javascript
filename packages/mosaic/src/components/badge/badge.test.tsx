import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';
import { BadgeContext } from './badge.context';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Badge', () => {
  it('renders its children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('gives a text child its own box to truncate against', () => {
    render(<Badge data-testid='badge'>Active</Badge>);
    const label = screen.getByTestId('badge').firstElementChild;
    expect(label?.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('Active');
  });

  it('applies the default color when none is passed', () => {
    render(<Badge data-testid='badge'>Active</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('cl-badge');
    expect(badge).toHaveAttribute('data-color', 'primary');
  });

  it.each(['primary', 'neutral', 'warning', 'negative', 'positive'] as const)('reflects the %s color', color => {
    render(
      <Badge
        color={color}
        data-testid='badge'
      >
        Active
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('data-color', color);
  });

  it('takes its color from BadgeContext when none is passed', () => {
    render(
      <BadgeContext.Provider value={{ color: 'neutral' }}>
        <Badge data-testid='badge'>Active</Badge>
      </BadgeContext.Provider>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('data-color', 'neutral');
  });

  it('lets an explicit color override the BadgeContext default', () => {
    render(
      <BadgeContext.Provider value={{ color: 'neutral' }}>
        <Badge
          color='positive'
          data-testid='badge'
        >
          Active
        </Badge>
      </BadgeContext.Provider>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('data-color', 'positive');
  });

  it('merges xstyle atoms after the slot atoms', () => {
    render(
      <Badge
        xstyle={atoms.spaced}
        data-testid='badge'
      >
        Active
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('cl-badge', stylex.props(atoms.spaced).className ?? '');
  });

  it('merges a className carried by the render element instead of clobbering the slot class', () => {
    render(
      <Badge
        render={<span className='from-source' />}
        data-testid='badge'
      >
        Active
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveClass('cl-badge', 'from-source');
  });

  it('forwards arbitrary span props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Badge
        ref={ref}
        id='status'
        data-testid='badge'
        aria-label='Status'
      >
        Active
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(ref.current).toBe(badge);
    expect(badge).toHaveAttribute('id', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Status');
  });

  it('renders a custom element via render, keeping the styling contract', () => {
    render(
      <Badge
        color='positive'
        // eslint-disable-next-line jsx-a11y/anchor-has-content -- Badge injects the children into the rendered anchor.
        render={<a href='/status' />}
      >
        Active
      </Badge>,
    );
    const badge = screen.getByRole('link', { name: 'Active' });
    expect(badge.tagName).toBe('A');
    expect(badge).toHaveAttribute('href', '/status');
    expect(badge).toHaveClass('cl-badge');
    expect(badge).toHaveAttribute('data-color', 'positive');
  });
});
