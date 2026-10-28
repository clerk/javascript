import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../__tests__/feature/render';
import type { MosaicRouter } from '../use-mosaic-router';
import { useMosaicRouter } from '../use-mosaic-router';

function Navigation({ to, hard = false }: { to: string; hard?: boolean }) {
  const router = useMosaicRouter();
  return (
    <button
      type='button'
      onClick={() => (hard ? router.windowNavigate(to) : void router.navigate(to))}
    >
      Navigate
    </button>
  );
}

function CaptureRouter({ onRouter }: { onRouter: (router: MosaicRouter) => void }) {
  onRouter(useMosaicRouter());
  return null;
}

async function renderRouter() {
  serveFapi();
  let captured: MosaicRouter | undefined;
  await renderWithClerk(<CaptureRouter onRouter={router => (captured = router)} />);
  if (!captured) {
    throw new Error('Router was not rendered');
  }
  return captured;
}

describe('Mosaic router', () => {
  it('uses the host router for ordinary same-origin navigation', async () => {
    serveFapi();
    const to = new URL('/router-destination', window.location.href).href;
    const { navigate } = await renderWithClerk(<Navigation to={to} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Navigate' }));
    expect(navigate).toHaveBeenCalledWith('/router-destination');
  });

  it.each([false, true])('hard-navigates a same-origin URL with an older runtime %s', async older => {
    const originalUrl = window.location.href;
    const to = new URL(originalUrl);
    to.hash = 'mosaic-hard-navigation';
    serveFapi();
    const { clerk, navigate } = await renderWithClerk(
      <Navigation
        to={to.href}
        hard
      />,
    );
    const descriptor = Object.getOwnPropertyDescriptor(clerk, '__internal_windowNavigate');
    if (older) {
      Object.defineProperty(clerk, '__internal_windowNavigate', { configurable: true, value: undefined });
    }
    const beforeUnload = vi.fn();
    window.addEventListener('clerk:beforeunload', beforeUnload);
    try {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Navigate' }));
      await waitFor(() => expect(window.location.href).toBe(to.href));
      expect(beforeUnload).toHaveBeenCalledOnce();
      expect(navigate).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('clerk:beforeunload', beforeUnload);
      window.history.replaceState(null, '', originalUrl);
      if (older && descriptor) {
        Object.defineProperty(clerk, '__internal_windowNavigate', descriptor);
      }
    }
  });

  it.each([false, true])('rejects unsafe hard-navigation protocols with an older runtime %s', async older => {
    const originalUrl = window.location.href;
    serveFapi();
    const { clerk, navigate } = await renderWithClerk(
      <Navigation
        to='javascript:void(0)'
        hard
      />,
    );
    const descriptor = Object.getOwnPropertyDescriptor(clerk, '__internal_windowNavigate');
    if (older) {
      Object.defineProperty(clerk, '__internal_windowNavigate', { configurable: true, value: undefined });
    }
    const beforeUnload = vi.fn();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.addEventListener('clerk:beforeunload', beforeUnload);
    try {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Navigate' }));
      expect(window.location.href).toBe(originalUrl);
      expect(beforeUnload).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect(warning).toHaveBeenCalledWith(expect.stringContaining('Aborting navigation'));
    } finally {
      window.removeEventListener('clerk:beforeunload', beforeUnload);
      if (older && descriptor) {
        Object.defineProperty(clerk, '__internal_windowNavigate', descriptor);
      }
    }
  });

  describe('getSearchParams', () => {
    const originalUrl = window.location.href;

    afterEach(() => {
      window.history.replaceState(null, '', originalUrl);
    });

    it('reads the current query with values decoded', async () => {
      const router = await renderRouter();
      window.history.replaceState(null, '', '?email_address=bob%40example.com');
      expect(router.getSearchParams().get('email_address')).toBe('bob@example.com');
    });

    it('returns null for a key that is not in the query', async () => {
      const router = await renderRouter();
      window.history.replaceState(null, '', '?email_address=bob%40example.com');
      expect(router.getSearchParams().get('missing')).toBeNull();
    });

    it('returns a fresh instance on each call', async () => {
      const router = await renderRouter();
      window.history.replaceState(null, '', '?step=one');
      const first = router.getSearchParams();
      first.set('step', 'two');
      first.append('extra', 'value');
      expect(router.getSearchParams().toString()).toBe('step=one');
    });
  });
});
