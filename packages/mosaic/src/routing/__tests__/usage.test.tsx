import type * as SharedReact from '@clerk/shared/react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicRoutingProvider, type MosaicRoutingProviderProps } from '../MosaicRoutingProvider';
import { useMosaicRoutes } from '../useMosaicRoutes';

const navigate = vi.fn((to: string, options?: { replace?: boolean }) => {
  history[options?.replace ? 'replaceState' : 'pushState'](null, '', to);
  return Promise.resolve();
});

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return { ...actual, useClerk: () => ({ navigate }) };
});

const profileRoutes = {
  account: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

function useProfileController() {
  const { route, params, go } = useMosaicRoutes(profileRoutes);
  return {
    route,
    statementId: params.statementId,
    openAccount: () => go('account'),
    openSecurity: () => go('security'),
    openStatement: (statementId: string) => go('statement', { statementId }),
  };
}

function ProfileView() {
  const { route, statementId, openAccount, openSecurity, openStatement } = useProfileController();

  if (route === 'security') {
    return (
      <section>
        <h1>Security</h1>
        <button
          type='button'
          onClick={() => void openAccount()}
        >
          Back
        </button>
      </section>
    );
  }

  if (route === 'statement') {
    return (
      <section>
        <h1>Statement {statementId}</h1>
        <button
          type='button'
          onClick={() => void openAccount()}
        >
          Back
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Account</h1>
      <button
        type='button'
        onClick={() => void openSecurity()}
      >
        Security
      </button>
      <button
        type='button'
        onClick={() => void openStatement('st_1')}
      >
        Latest statement
      </button>
    </section>
  );
}

function renderProfile(routing: Omit<MosaicRoutingProviderProps, 'children'>) {
  return render(
    <MosaicRoutingProvider {...routing}>
      <ProfileView />
    </MosaicRoutingProvider>,
  );
}

async function click(name: string) {
  await act(() => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
}

beforeEach(() => {
  navigate.mockClear();
  history.replaceState(null, '', '/user-profile');
});

afterEach(() => {
  cleanup();
});

describe('a profile mounted with path routing', () => {
  it('opens the page in the URL', () => {
    history.replaceState(null, '', '/user-profile/billing/statement/st_1');

    renderProfile({ routing: 'path', path: '/user-profile' });

    expect(screen.getByRole('heading', { name: 'Statement st_1' })).toBeDefined();
  });

  it('moves between pages through the host router', async () => {
    renderProfile({ routing: 'path', path: '/user-profile' });

    await click('Latest statement');

    expect(screen.getByRole('heading', { name: 'Statement st_1' })).toBeDefined();
    expect(window.location.pathname).toBe('/user-profile/billing/statement/st_1');
    expect(navigate).toHaveBeenCalledWith('/user-profile/billing/statement/st_1', {
      replace: false,
      metadata: { navigationType: 'internal' },
    });

    await click('Back');

    expect(screen.getByRole('heading', { name: 'Account' })).toBeDefined();
    expect(window.location.pathname).toBe('/user-profile');
  });
});

describe('a profile mounted with hash routing', () => {
  it('keeps the page in the hash without calling the host router', async () => {
    renderProfile({ routing: 'hash' });

    await click('Security');

    expect(screen.getByRole('heading', { name: 'Security' })).toBeDefined();
    expect(window.location.hash).toBe('#/security');
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('a profile mounted in a modal with memory routing', () => {
  it('opens on the initial page and never touches the URL', async () => {
    renderProfile({ routing: 'memory', initialPath: 'security' });
    expect(screen.getByRole('heading', { name: 'Security' })).toBeDefined();

    await click('Back');

    expect(screen.getByRole('heading', { name: 'Account' })).toBeDefined();
    expect(window.location.href).toBe('http://localhost:3000/user-profile');
    expect(navigate).not.toHaveBeenCalled();
  });
});
