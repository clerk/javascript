import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Avatar } from './avatar';

// jsdom never fires load/error on images, so drive `new window.Image()` manually.
// Each instance resolves to the outcome keyed by its `src`. A `cached` src reports `complete`
// the moment it is assigned, the way a browser does for an image it already holds.
type Outcome = 'load' | 'error';
let outcomes: Record<string, Outcome> = {};
let cached = new Set<string>();

class MockImage {
  complete = false;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(value: string) {
    if (cached.has(value)) {
      this.complete = true;
      return;
    }
    queueMicrotask(() => {
      if (outcomes[value] === 'error') {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

vi.stubGlobal('Image', MockImage);

afterEach(() => {
  outcomes = {};
  cached = new Set();
});

describe('Mosaic Avatar', () => {
  it('applies default variants and reflects them as data attributes', () => {
    render(
      <Avatar.Root data-testid='avatar'>
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('cl-avatar');
    expect(avatar).toHaveAttribute('data-shape', 'circle');
    expect(avatar).toHaveAttribute('data-size', 'md');
  });

  it('reflects shape and size overrides', () => {
    render(
      <Avatar.Root
        data-testid='avatar'
        shape='square'
        size='lg'
      >
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-shape', 'square');
    expect(avatar).toHaveAttribute('data-size', 'lg');
  });

  it('shows the fallback while the image has not loaded', () => {
    outcomes['https://example.com/a.png'] = 'error';
    render(
      <Avatar.Root>
        <Avatar.Image src='https://example.com/a.png' />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const fallback = screen.getByText('CN');
    expect(fallback).toHaveClass('cl-avatar-fallback');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the image and hides the fallback once it loads', async () => {
    outcomes['https://example.com/a.png'] = 'load';
    render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const img = await screen.findByRole('img', { name: 'Alex' });
    expect(img).toHaveClass('cl-avatar-image');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(screen.queryByText('CN')).not.toBeInTheDocument();
  });

  it('renders the image undraggable, and lets a consumer opt back in', async () => {
    outcomes['https://example.com/a.png'] = 'load';
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
      </Avatar.Root>,
    );
    expect(await screen.findByRole('img', { name: 'Alex' })).toHaveAttribute('draggable', 'false');

    rerender(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
          draggable
        />
      </Avatar.Root>,
    );
    expect(await screen.findByRole('img', { name: 'Alex' })).toHaveAttribute('draggable', 'true');
  });

  // The rows this sits in remount whenever they change shape, and the header swaps between
  // organizations that are already on screen. Either one re-resolves an image the browser already
  // holds, so anything short of resolving before the first paint reads as the avatar disappearing.
  it('shows a cached image without a pass through the fallback', () => {
    cached.add('https://example.com/cached.png');
    render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/cached.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );

    expect(screen.getByRole('img', { name: 'Alex' })).toBeInTheDocument();
    expect(screen.queryByText('CN')).not.toBeInTheDocument();
  });

  it('swaps straight to a cached image rather than falling back between the two', async () => {
    outcomes['https://example.com/a.png'] = 'load';
    cached.add('https://example.com/b.png');
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    await screen.findByRole('img', { name: 'Alex' });

    rerender(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/b.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );

    expect(screen.getByRole('img', { name: 'Alex' })).toHaveAttribute('src', 'https://example.com/b.png');
    expect(screen.queryByText('CN')).not.toBeInTheDocument();
  });

  it('keeps the fallback when the image errors', async () => {
    outcomes['https://example.com/bad.png'] = 'error';
    render(
      <Avatar.Root>
        <Avatar.Image src='https://example.com/bad.png' />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    await waitFor(() => expect(screen.getByText('CN')).toBeInTheDocument());
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('wires consumer className/style/ref through to the root', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar.Root
        ref={ref}
        data-testid='avatar'
        className='my-avatar'
        style={{ marginTop: '8px' }}
      >
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(ref.current).toBe(avatar);
    expect(avatar).toHaveClass('cl-avatar', 'my-avatar');
    expect(avatar).toHaveStyle({ marginTop: '8px' });
  });

  it('throws when a part is rendered outside <Avatar.Root>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Avatar.Fallback>CN</Avatar.Fallback>)).toThrow(/must be rendered inside <Avatar.Root>/);
    spy.mockRestore();
  });
});
