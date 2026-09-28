import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { HeadingLevelProvider } from '../heading';
import { Section } from '../section';
import { Panel } from './panel';

function Account() {
  return (
    <Panel.Root data-testid='root'>
      <Panel.Title>Account</Panel.Title>
      <Panel.Sections data-testid='sections'>
        <Section.Root>
          <Section.Title>Email addresses</Section.Title>
        </Section.Root>
      </Panel.Sections>
    </Panel.Root>
  );
}

describe('Panel', () => {
  it('renders every part with its slot', () => {
    render(
      <MosaicProvider>
        <Account />
      </MosaicProvider>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-panel');
    expect(screen.getByTestId('sections')).toHaveClass('cl-panel-sections');
    expect(screen.getByRole('heading', { name: 'Account' }).parentElement).toHaveClass('cl-panel-title');
  });

  it('titles the panel at level 2 and its sections one level below', () => {
    render(
      <MosaicProvider>
        <Account />
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toHaveClass('cl-heading');
    expect(screen.getByRole('heading', { level: 3, name: 'Email addresses' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('starts from the level of an enclosing HeadingLevelProvider', () => {
    render(
      <MosaicProvider>
        <HeadingLevelProvider level={4}>
          <Account />
        </HeadingLevelProvider>
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Email addresses' })).toBeInTheDocument();
  });
});
