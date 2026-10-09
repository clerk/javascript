import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Entity } from './entity';

const overrides = stylex.create({
  root: { marginTop: '8px' },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

describe('Mosaic Entity', () => {
  it('renders the composed parts with their stable classes', () => {
    render(
      <Entity.Root data-testid='root'>
        <Entity.Media data-testid='media'>
          <span>avatar</span>
        </Entity.Media>
        <Entity.Content data-testid='content'>
          <Entity.Label data-testid='label'>Cameron Walker</Entity.Label>
          <Entity.Description>cameron@clerk.com</Entity.Description>
        </Entity.Content>
      </Entity.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('cl-entity');
    expect(screen.getByTestId('media')).toHaveClass('cl-entity-media');
    expect(screen.getByTestId('content')).toHaveClass('cl-entity-content');
    expect(screen.getByTestId('label')).toHaveClass('cl-entity-label');
    expect(screen.getByText('cameron@clerk.com')).toHaveClass('cl-entity-description');
  });

  it('gives the label text its own box to truncate, leaving a badge beside it whole', () => {
    render(
      <Entity.Label data-testid='label'>
        Cameron Walker
        <span>Default</span>
      </Entity.Label>,
    );
    const label = screen.getByTestId('label');
    expect(screen.getByText('Cameron Walker')).not.toBe(label);
    expect(screen.getByText('Cameron Walker').parentElement).toBe(label);
    expect(screen.getByText('Default').parentElement).toBe(label);
  });

  it('applies xstyle to the root element', () => {
    render(<Entity.Root xstyle={overrides.root}>Hi</Entity.Root>);
    expect(screen.getByText('Hi')).toHaveClass('cl-entity', ...atoms(overrides.root));
  });

  it('merges a render-sourced className instead of clobbering its own', () => {
    render(<Entity.Content render={<Entity.Description />}>Hi</Entity.Content>);
    expect(screen.getByText('Hi')).toHaveClass('cl-entity-content', 'cl-entity-description');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Entity.Root ref={ref}>Hi</Entity.Root>);
    expect(ref.current).toBe(screen.getByText('Hi'));
  });
});
