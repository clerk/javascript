import * as stylex from '@stylexjs/stylex';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Icon } from '../icon';
import { Avatar } from './avatar';
import { styles } from './avatar.styles';

// React reads this off the global object and ships no typing for it.
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

let cached = new Set<string>();
let cachedFailed = new Set<string>();

vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function () {
  const src = this.getAttribute('src');
  return src !== null && (cached.has(src) || cachedFailed.has(src));
});
vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockImplementation(function () {
  const src = this.getAttribute('src');
  return src !== null && cached.has(src) ? 100 : 0;
});

afterEach(() => {
  cached = new Set();
  cachedFailed = new Set();
});

describe('Mosaic Avatar', () => {
  it('renders a source-bearing image on the server before hydration', () => {
    const html = renderToString(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/server.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );

    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/server.png"');
    expect(html).not.toContain('avatar__styles.imageHidden');
  });

  it('hydrates the server image in place', async () => {
    cached.add('https://example.com/server.png');
    const avatar = (
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/server.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>
    );
    const container = document.body.appendChild(document.createElement('div'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    container.innerHTML = renderToString(avatar);
    const serverImage = container.querySelector('img');
    const root = hydrateRoot(container, avatar);

    try {
      await act(async () => {
        await Promise.resolve();
      });
      expect(container.querySelector('img')).toBe(serverImage);
      expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/server.png');
      expect(container.textContent).toBe('');
      expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/Hydration failed|did not match|server HTML/);
    } finally {
      act(() => root.unmount());
      container.remove();
      consoleError.mockRestore();
    }
  });

  it('keeps a cached failed image hidden and recovers on a source change', () => {
    cachedFailed.add('https://example.com/bad.png');
    cached.add('https://example.com/good.png');
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/bad.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const image = screen.getByAltText('Alex');
    expect(image).toHaveClass(stylex.props(styles.imageHidden).className ?? '');
    expect(screen.getByText('CN')).toBeInTheDocument();

    rerender(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/good.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByRole('img', { name: 'Alex' })).toBe(image);
    expect(image).not.toHaveClass(stylex.props(styles.imageHidden).className ?? '');
    expect(screen.queryByText('CN')).not.toBeInTheDocument();
  });

  it('keeps responsive attributes, forwards its ref, and composes image events', () => {
    const ref = React.createRef<HTMLImageElement>();
    const onLoad = vi.fn();
    const onError = vi.fn();
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image
          ref={ref}
          src='https://example.com/a.png'
          srcSet='https://example.com/a-2x.png 2x'
          sizes='48px'
          alt='Alex'
          onLoad={onLoad}
          onError={onError}
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const image = screen.getByAltText('Alex');
    expect(ref.current).toBe(image);
    expect(image).toHaveAttribute('srcset', 'https://example.com/a-2x.png 2x');
    expect(image).toHaveAttribute('sizes', '48px');
    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledOnce();
    expect(screen.queryByText('CN')).not.toBeInTheDocument();

    rerender(
      <Avatar.Root>
        <Avatar.Image
          ref={ref}
          src='https://example.com/a.png'
          srcSet='https://example.com/b-2x.png 2x'
          sizes='96px'
          alt='Alex'
          onLoad={onLoad}
          onError={onError}
        />
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(ref.current).toBe(image);
    expect(image).toHaveAttribute('srcset', 'https://example.com/b-2x.png 2x');
    expect(image).toHaveAttribute('sizes', '96px');
    expect(screen.getByTestId('fallback')).toHaveAttribute('data-pending', '');
    fireEvent.error(image);
    expect(onError).toHaveBeenCalledOnce();
    expect(image).toHaveClass(stylex.props(styles.imageHidden).className ?? '');
  });

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
    expect(avatar).toHaveAttribute('data-bordered', '');
  });

  it('draws the inset outline on the image and fallback by default', () => {
    const overlay = stylex.props(styles.overlay).className ?? '';
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('fallback')).toHaveClass(overlay);
    rerender(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    fireEvent.load(screen.getByAltText('Alex'));
    expect(screen.getByRole('img', { name: 'Alex' })).toHaveClass(overlay);
  });

  it('drops the inset outline when bordered is false', () => {
    const overlay = stylex.props(styles.overlay).className ?? '';
    render(
      <Avatar.Root
        data-testid='avatar'
        bordered={false}
      >
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('avatar')).not.toHaveAttribute('data-bordered');
    expect(screen.getByTestId('fallback')).not.toHaveClass(overlay);
    fireEvent.load(screen.getByAltText('Alex'));
    expect(screen.getByRole('img', { name: 'Alex' })).not.toHaveClass(overlay);
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
    render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByText('CN').closest('.cl-avatar-fallback')).toBeInTheDocument();
    expect(screen.getByAltText('Alex')).toHaveClass(stylex.props(styles.imageHidden).className ?? '');
  });

  it('renders the image and hides the fallback once it loads', () => {
    render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    fireEvent.load(screen.getByAltText('Alex'));
    const img = screen.getByRole('img', { name: 'Alex' });
    expect(img).toHaveClass('cl-avatar-image');
    expect(img).not.toHaveClass(stylex.props(styles.imageHidden).className ?? '');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(screen.queryByText('CN')).not.toBeInTheDocument();
  });

  it('renders the image undraggable, and lets a consumer opt back in', () => {
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
        />
      </Avatar.Root>,
    );
    fireEvent.load(screen.getByAltText('Alex'));
    expect(screen.getByRole('img', { name: 'Alex' })).toHaveAttribute('draggable', 'false');

    rerender(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/a.png'
          alt='Alex'
          draggable
        />
      </Avatar.Root>,
    );
    expect(screen.getByRole('img', { name: 'Alex' })).toHaveAttribute('draggable', 'true');
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

  // `render` wraps in `act`, which drains passive effects and the re-render they schedule before it
  // returns, so it cannot tell a layout effect from a `useEffect` here. Driving the root directly is
  // what pins the guarantee down: `flushSync` runs layout effects and the update they raise, and
  // stops short of passive effects. The image has to be committed by then, or a browser gets a frame
  // with the initials in it.
  it('commits a cached image before passive effects run, so no frame shows the fallback', () => {
    cached.add('https://example.com/cached.png');
    const container = document.body.appendChild(document.createElement('div'));
    const root = createRoot(container);
    const wasActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;

    try {
      flushSync(() => {
        root.render(
          <Avatar.Root>
            <Avatar.Image
              src='https://example.com/cached.png'
              alt='Alex'
            />
            <Avatar.Fallback>CN</Avatar.Fallback>
          </Avatar.Root>,
        );
      });

      expect(container.querySelector('img')).toHaveAttribute('alt', 'Alex');
      expect(container.textContent).toBe('');
    } finally {
      flushSync(() => root.unmount());
      container.remove();
      globalThis.IS_REACT_ACT_ENVIRONMENT = wasActEnvironment;
    }
  });

  it('swaps straight to a cached image rather than falling back between the two', () => {
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
    fireEvent.load(screen.getByAltText('Alex'));

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
    render(
      <Avatar.Root>
        <Avatar.Image
          src='https://example.com/bad.png'
          alt='Alex'
        />
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const image = screen.getByAltText('Alex');
    fireEvent.error(image);
    await waitFor(() => expect(screen.getByText('CN')).toBeInTheDocument());
    expect(screen.getByAltText('Alex')).toBe(image);
    expect(image).toHaveClass(stylex.props(styles.imageHidden).className ?? '');
  });

  it('holds the fallback content in a slot of its own rather than painting it', () => {
    render(
      <Avatar.Root>
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('fallback')).toHaveTextContent('CN');
    expect(screen.getByText('CN')).toHaveClass('cl-avatar-fallback-content');
  });

  it('pulses only while an image is still resolving', async () => {
    const { rerender } = render(
      <Avatar.Root>
        <Avatar.Image src='https://example.com/slow.png' />
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('fallback')).toHaveAttribute('data-pending', '');

    rerender(
      <Avatar.Root>
        <Avatar.Image src='https://example.com/bad.png' />
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    fireEvent.error(screen.getByAltText(''));
    await waitFor(() => expect(screen.getByTestId('fallback')).not.toHaveAttribute('data-pending'));
  });

  it('holds still when there is no image to wait for', () => {
    render(
      <Avatar.Root>
        <Avatar.Fallback data-testid='fallback'>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('fallback')).not.toHaveAttribute('data-pending');
  });

  it('wires consumer xstyle and ref through to the root', () => {
    const caller = stylex.create({ root: { marginTop: '8px' } });
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar.Root
        ref={ref}
        data-testid='avatar'
        xstyle={caller.root}
      >
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(ref.current).toBe(avatar);
    expect(avatar).toHaveClass('cl-avatar', stylex.props(caller.root).className ?? '');
  });

  it('merges the className a render source hands the root', () => {
    render(
      <Avatar.Root
        data-testid='avatar'
        render={<span className='from-render' />}
      >
        <Avatar.Fallback>CN</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('cl-avatar', 'from-render');
  });

  it('composes its root onto another element and renders an icon affordance', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar.Root
        ref={ref}
        size='lg'
        render={
          <button
            type='button'
            aria-label='Edit profile picture'
          />
        }
      >
        <Avatar.Fallback>CN</Avatar.Fallback>
        <Avatar.Icon>
          <Icon name='pen' />
        </Avatar.Icon>
      </Avatar.Root>,
    );

    const button = screen.getByRole('button', { name: 'Edit profile picture' });
    expect(button).toHaveClass('cl-avatar');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(ref.current).toBe(button);
    expect(button.querySelector('.cl-avatar-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('throws when a part is rendered outside <Avatar.Root>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Avatar.Fallback>CN</Avatar.Fallback>)).toThrow(/must be rendered inside <Avatar.Root>/);
    expect(() => render(<Avatar.Icon />)).toThrow(/must be rendered inside <Avatar.Root>/);
    spy.mockRestore();
  });
});
