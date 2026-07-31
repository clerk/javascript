import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { scrollbarVars } from '../../tokens.stylex';
import { ScrollArea } from './scroll-area';
import { scrollAreaVars } from './scroll-area.vars.stylex';

describe('Mosaic ScrollArea', () => {
  it('renders its children inside the viewport', () => {
    render(
      <ScrollArea.Root>
        <ScrollArea.Viewport>Contents</ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    expect(screen.getByText('Contents')).toBeInTheDocument();
  });

  it('carries the stable slot classes', () => {
    render(
      <ScrollArea.Root data-testid='root'>
        <ScrollArea.Viewport data-testid='viewport'>Contents</ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('cl-scroll-area-root');
    expect(screen.getByTestId('viewport')).toHaveClass('cl-scroll-area-viewport');
  });

  it('defaults to the auto gutter so a non-resizing list keeps the full width', () => {
    render(<ScrollArea.Viewport data-testid='viewport'>Contents</ScrollArea.Viewport>);
    expect(screen.getByTestId('viewport')).toHaveAttribute('data-gutter', 'auto');
  });

  it.each(['stable', 'auto'] as const)('reflects the %s gutter', gutter => {
    render(
      <ScrollArea.Viewport
        data-testid='viewport'
        gutter={gutter}
      >
        Contents
      </ScrollArea.Viewport>,
    );
    expect(screen.getByTestId('viewport')).toHaveAttribute('data-gutter', gutter);
  });

  it('lets the consumer className and style win', () => {
    render(
      <ScrollArea.Viewport
        data-testid='viewport'
        className='my-scroller'
        style={{ maxHeight: '240px' }}
      >
        Contents
      </ScrollArea.Viewport>,
    );
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveClass('cl-scroll-area-viewport', 'my-scroller');
    expect(viewport).toHaveStyle({ maxHeight: '240px' });
  });

  it('forwards arbitrary div props and the ref on both parts', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const viewportRef = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea.Root
        ref={rootRef}
        data-testid='root'
      >
        <ScrollArea.Viewport
          ref={viewportRef}
          data-testid='viewport'
          tabIndex={0}
          aria-label='Members'
        >
          Contents
        </ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    expect(rootRef.current).toBe(screen.getByTestId('root'));
    const viewport = screen.getByTestId('viewport');
    expect(viewportRef.current).toBe(viewport);
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAttribute('aria-label', 'Members');
  });

  // The `--cl-*` names are the component's public API — a consumer's stylesheet references them
  // by hand, and `clerk-js` ships to apps pinned to older SDKs, so renaming one breaks themes
  // already in the wild. Assert the exact strings so a rename has to be a deliberate act.
  it('emits the documented public custom properties', () => {
    // `toMatchObject`, not `toEqual`: StyleX adds an internal `__varGroupHash__` key, and adding
    // a new var is not itself a breaking change — removing or renaming one is.
    expect(scrollAreaVars).toMatchObject({
      '--cl-scroll-area-progress-start': 'var(--cl-scroll-area-progress-start)',
      '--cl-scroll-area-progress-end': 'var(--cl-scroll-area-progress-end)',
      '--cl-scroll-area-fade-size': 'var(--cl-scroll-area-fade-size)',
      '--cl-scroll-area-fade-range': 'var(--cl-scroll-area-fade-range)',
      '--cl-scroll-area-scrollbar-inset': 'var(--cl-scroll-area-scrollbar-inset)',
    });
  });

  // Shared across every scrolling surface in Mosaic rather than owned here, but the viewport
  // reads it, so a rename would silently drop the scrollbar sizing.
  it('reads the shared scrollbar-width token', () => {
    expect(scrollbarVars).toMatchObject({ '--cl-scrollbar-width': 'var(--cl-scrollbar-width)' });
  });

  it('does not make the viewport focusable on its own', () => {
    render(<ScrollArea.Viewport data-testid='viewport'>Contents</ScrollArea.Viewport>);
    expect(screen.getByTestId('viewport')).not.toHaveAttribute('tabindex');
  });
});
