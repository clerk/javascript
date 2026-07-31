import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { scrollbarVars, scrollFadeVars } from '../../tokens.stylex';
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
  it('emits the documented per-element progress properties', () => {
    // `toMatchObject`, not `toEqual`: StyleX adds an internal `__varGroupHash__` key, and adding
    // a new var is not itself a breaking change — removing or renaming one is.
    expect(scrollAreaVars).toMatchObject({
      '--cl-scroll-area-progress-start': 'var(--cl-scroll-area-progress-start)',
      '--cl-scroll-area-progress-end': 'var(--cl-scroll-area-progress-end)',
    });
  });

  // Shared across every scrolling surface in Mosaic rather than owned here, but the viewport
  // reads them, so a rename would silently drop the scrollbar sizing or the fade's knobs.
  it('reads the shared scroll tokens', () => {
    expect(scrollbarVars).toMatchObject({ '--cl-scrollbar-width': 'var(--cl-scrollbar-width)' });
    expect(scrollFadeVars).toMatchObject({
      '--cl-scroll-fade-size': 'var(--cl-scroll-fade-size)',
      '--cl-scroll-fade-range': 'var(--cl-scroll-fade-range)',
      '--cl-scroll-fade-inset': 'var(--cl-scroll-fade-inset)',
    });
  });

  it('renders custom elements via render, keeping the styling contract', () => {
    render(
      <ScrollArea.Root
        data-testid='root'
        render={<section />}
      >
        <ScrollArea.Viewport
          data-testid='viewport'
          render={<ul aria-label='Members' />}
        >
          <li>Ada Lovelace</li>
        </ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    const root = screen.getByTestId('root');
    const viewport = screen.getByTestId('viewport');
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveClass('cl-scroll-area-root');
    expect(viewport.tagName).toBe('UL');
    expect(viewport).toHaveClass('cl-scroll-area-viewport');
    expect(viewport).toHaveAttribute('data-gutter', 'auto');
  });

  describe('keyboard reachability', () => {
    // jsdom reports every box as zero-sized, so overflow has to be faked. Both values are
    // stubbed together because the check is a comparison, not a threshold.
    const setOverflow = (element: HTMLElement, overflowing: boolean) => {
      Object.defineProperty(element, 'scrollHeight', { configurable: true, value: overflowing ? 400 : 100 });
      Object.defineProperty(element, 'clientHeight', { configurable: true, value: 100 });
    };

    // The element has to overflow before the effect's first sync runs, so the stubs are
    // installed from the callback ref rather than after render.
    const renderViewport = (overflowing: boolean, children: React.ReactNode) =>
      render(
        <ScrollArea.Viewport
          data-testid='viewport'
          ref={element => {
            if (element) {
              setOverflow(element, overflowing);
            }
          }}
        >
          {children}
        </ScrollArea.Viewport>,
      );

    it('takes a tab stop when it overflows and holds nothing focusable', () => {
      renderViewport(true, <p>Contents</p>);
      expect(screen.getByTestId('viewport')).toHaveAttribute('tabindex', '0');
    });

    it('takes no tab stop when there is nothing to scroll', () => {
      renderViewport(false, <p>Contents</p>);
      expect(screen.getByTestId('viewport')).not.toHaveAttribute('tabindex');
    });

    // Tabbing into the content already scrolls the region, so a stop on the container would be
    // a redundant one. Chrome and Firefox make the same exclusion.
    it('takes no tab stop when its content is already reachable', () => {
      renderViewport(true, <button type='button'>Ada Lovelace</button>);
      expect(screen.getByTestId('viewport')).not.toHaveAttribute('tabindex');
    });

    it('lets an explicit tabIndex win over the managed one', () => {
      render(
        <ScrollArea.Viewport
          data-testid='viewport'
          tabIndex={-1}
          ref={element => {
            if (element) {
              setOverflow(element, true);
            }
          }}
        >
          <p>Contents</p>
        </ScrollArea.Viewport>,
      );
      expect(screen.getByTestId('viewport')).toHaveAttribute('tabindex', '-1');
    });
  });
});
