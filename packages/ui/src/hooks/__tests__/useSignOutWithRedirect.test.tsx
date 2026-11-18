import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HashRouter, PathRouter, Route, useRouter, VirtualRouter } from '@/ui/router';
import { bindCreateFixtures } from '@/ui/test/create-fixtures';
import { render, screen, waitFor } from '@/ui/test/utils';

import { useSignOutWithRedirect } from '../useSignOutWithRedirect';

const { createFixtures } = bindCreateFixtures('UserButton');
const originalLocation = Object.getOwnPropertyDescriptor(window, 'location');

const SignOutButton = ({ to }: { to: string }) => {
  const { navigate } = useRouter();
  const signOut = useSignOutWithRedirect();
  return (
    <button
      type='button'
      onClick={() => void signOut(() => navigate(to), to)}
    >
      Sign out
    </button>
  );
};

afterEach(() => {
  if (originalLocation) {
    Object.defineProperty(window, 'location', originalLocation);
  }
  vi.restoreAllMocks();
});

describe('sign-out callback routing', () => {
  it.each(['path', 'hash', 'virtual'] as const)('preserves %s internal navigation and query parameters', async kind => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL(
        kind === 'hash'
          ? 'https://satellite.test/sign-in#/start?preserved=1'
          : 'https://satellite.test/sign-in/start?preserved=1',
      ),
    });
    const { fixtures, wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    vi.spyOn(fixtures.clerk, 'isSatellite', 'get').mockReturnValue(true);
    fixtures.clerk.signOut.mockImplementation(async callback => {
      if (typeof callback !== 'function') {
        throw new Error('Expected the legacy navigation callback');
      }
      await callback();
    });
    const content = (
      <>
        <Route path='start'>
          <SignOutButton to='../done' />
        </Route>
        <Route path='done'>
          <div>Signed out</div>
        </Route>
      </>
    );
    const tree =
      kind === 'path' ? (
        <PathRouter
          basePath='/sign-in'
          preservedParams={['preserved']}
        >
          {content}
        </PathRouter>
      ) : kind === 'hash' ? (
        <HashRouter preservedParams={['preserved']}>{content}</HashRouter>
      ) : (
        <VirtualRouter
          startPath='/start?preserved=1'
          preservedParams={['preserved']}
        >
          {content}
        </VirtualRouter>
      );
    const { userEvent } = render(tree, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByText('Signed out')).toBeInTheDocument());
    expect(fixtures.clerk.signOut).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    if (kind === 'path') {
      expect(fixtures.clerk.navigate).toHaveBeenCalledExactlyOnceWith('/sign-in/done?preserved=1', {
        metadata: { navigationType: 'internal' },
      });
    }
    if (kind === 'hash') {
      expect(window.location.hash).toBe('#/done?preserved=1');
    }
    if (kind === 'virtual') {
      expect(fixtures.clerk.navigate).not.toHaveBeenCalled();
    }
  });

  it('lets an older runtime ignore repair metadata and execute the original callback', async () => {
    const { fixtures, wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    vi.spyOn(fixtures.clerk, 'isSatellite', 'get').mockReturnValue(true);
    fixtures.clerk.signOut.mockImplementation(async callback => {
      if (typeof callback !== 'function') {
        throw new Error('Expected the legacy navigation callback');
      }
      await callback();
    });
    const to = 'https://satellite.test/signed-out?keep=1#section';
    const { userEvent } = render(<SignOutButton to={to} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(fixtures.clerk.signOut).toHaveBeenCalledExactlyOnceWith(expect.any(Function), {
      __internal_satelliteSignOutRedirectUrl: to,
    });
    expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith(to);
  });

  it.each(['/CLERK-ROUTER/HASH/other', '/CLERK-ROUTER/VIRTUAL/other', 'https://', 'javascript:alert(1)'])(
    'keeps destination %s on the original callback path',
    async to => {
      const { fixtures, wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      vi.spyOn(fixtures.clerk, 'isSatellite', 'get').mockReturnValue(true);
      fixtures.clerk.signOut.mockImplementation(async callback => {
        if (typeof callback !== 'function') {
          throw new Error('Expected the legacy navigation callback');
        }
        await callback();
      });
      const { userEvent } = render(<SignOutButton to={to} />, { wrapper });
      await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
      expect(fixtures.clerk.signOut).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
      expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith(to);
    },
  );
});
