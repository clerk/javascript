import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';

describe('Mosaic Badge', () => {
  it('renders its children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies the default intent when none is passed', () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('cl-badge');
    expect(badge).toHaveAttribute('data-intent', 'primary');
  });

  it.each(['primary', 'secondary', 'warning', 'destructive', 'success'] as const)('reflects the %s intent', intent => {
    render(<Badge intent={intent}>Active</Badge>);
    expect(screen.getByText('Active')).toHaveAttribute('data-intent', intent);
  });

  it('lets the consumer className and style win', () => {
    render(
      <Badge
        className='my-badge'
        style={{ marginTop: '8px' }}
      >
        Active
      </Badge>,
    );
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('cl-badge', 'my-badge');
    expect(badge).toHaveStyle({ marginTop: '8px' });
  });

  it('forwards arbitrary span props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Badge
        ref={ref}
        id='status'
        aria-label='Status'
      >
        Active
      </Badge>,
    );
    const badge = screen.getByText('Active');
    expect(ref.current).toBe(badge);
    expect(badge).toHaveAttribute('id', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Status');
  });

  it('renders a custom element via render, keeping the styling contract', () => {
    render(
      <Badge
        intent='success'
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
    expect(badge).toHaveAttribute('data-intent', 'success');
  });
});
