import { act, render, screen } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Avatar } from './avatar';

const purple = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="purple"/></svg>')}`;
const green = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="green"/></svg>')}`;

function avatar(src: string) {
  return (
    <Avatar.Root>
      <Avatar.Image
        src={src}
        alt='Profile picture'
      />
      <Avatar.Fallback>AB</Avatar.Fallback>
    </Avatar.Root>
  );
}

describe('Avatar browser rendering', () => {
  it('paints the server image above its fallback before hydration', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(avatar(purple));
    const image = container.querySelector('img');
    if (!image) {
      throw new Error('Server avatar image is missing');
    }
    await image.decode();
    expect(image.naturalWidth).toBeGreaterThan(0);
    expect(image).toBeVisible();
    const bounds = image.getBoundingClientRect();
    expect(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)).toBe(image);
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(container, avatar(purple), { onRecoverableError });
    try {
      await act(async () => {
        await Promise.resolve();
      });
      expect(container.querySelector('img')).toBe(image);
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(image).toBeVisible();
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });

  it('keeps cached images visible through remounts and source swaps', async () => {
    await Promise.all(
      [purple, green].map(async src => {
        const image = new Image();
        image.src = src;
        await image.decode();
      }),
    );
    const view = render(avatar(purple));
    expect(screen.getByRole('img', { name: 'Profile picture' })).toBeVisible();
    expect(screen.queryByText('AB')).not.toBeInTheDocument();
    flushSync(() => view.rerender(avatar(green)));
    expect(screen.getByRole('img', { name: 'Profile picture' })).toHaveAttribute('src', green);
    expect(screen.queryByText('AB')).not.toBeInTheDocument();
    view.unmount();
    render(avatar(purple));
    expect(screen.getByRole('img', { name: 'Profile picture' })).toBeVisible();
    expect(screen.queryByText('AB')).not.toBeInTheDocument();
  });
});
