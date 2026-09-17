import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './empty-state';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic EmptyState', () => {
  it('renders each part with its slot class', () => {
    render(
      <EmptyState.Root>
        <EmptyState.Icon name='search' />
        <EmptyState.Label>No API keys</EmptyState.Label>
        <EmptyState.Description>Create a key to get started.</EmptyState.Description>
        <EmptyState.Actions>
          <button type='button'>Create key</button>
        </EmptyState.Actions>
      </EmptyState.Root>,
    );
    const title = screen.getByText('No API keys');
    expect(title).toHaveClass('cl-empty-state-label');
    expect(title.closest('.cl-empty-state')).not.toBeNull();
    expect(screen.getByText('Create a key to get started.')).toHaveClass('cl-empty-state-description');
    expect(screen.getByRole('button', { name: 'Create key' }).parentElement).toHaveClass('cl-empty-state-actions');
  });

  it('frames the icon in a filled icon frame', () => {
    const { container } = render(
      <EmptyState.Root>
        <EmptyState.Icon name='search' />
        <EmptyState.Label>No results</EmptyState.Label>
      </EmptyState.Root>,
    );
    const frame = container.querySelector('.cl-empty-state-icon .cl-icon-frame');
    expect(frame).not.toBeNull();
    expect(frame).toHaveAttribute('data-filled', '');
    expect(frame?.querySelector('.cl-icon')).not.toBeNull();
  });

  it('merges xstyle atoms and forwards the ref on each part', () => {
    const ref = React.createRef<HTMLDivElement>();
    const titleRef = React.createRef<HTMLParagraphElement>();
    render(
      <EmptyState.Root
        ref={ref}
        xstyle={atoms.spaced}
      >
        <EmptyState.Label
          ref={titleRef}
          xstyle={atoms.spaced}
        >
          Nothing here
        </EmptyState.Label>
      </EmptyState.Root>,
    );
    const atom = stylex.props(atoms.spaced).className ?? '';
    expect(ref.current).toHaveClass('cl-empty-state', atom);
    expect(titleRef.current).toHaveClass('cl-empty-state-label', atom);
  });
});
