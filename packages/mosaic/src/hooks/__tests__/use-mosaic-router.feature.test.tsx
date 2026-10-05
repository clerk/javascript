import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../__tests__/feature/render';
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
      warning.mockRestore();
      window.removeEventListener('clerk:beforeunload', beforeUnload);
      if (older && descriptor) {
        Object.defineProperty(clerk, '__internal_windowNavigate', descriptor);
      }
    }
  });
});
