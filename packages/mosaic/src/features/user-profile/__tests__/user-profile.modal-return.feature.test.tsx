import { Clerk } from '@clerk/clerk-js';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, configure, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';

import { publishableKey, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';

beforeAll(async () => {
  await import('../user-profile.modal-content');
});

beforeAll(() => page.viewport(1280, 800));

function serve() {
  serveFapi({
    environment: fapiEnvironment(),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
  });
}

function visit(search: string) {
  const original = window.location.href;
  window.history.replaceState(null, '', `${window.location.pathname}${search}#accounts`);
  onTestFinished(() => window.history.replaceState(null, '', original));
}

function strictMode() {
  configure({ reactStrictMode: true });
  onTestFinished(() => configure({ reactStrictMode: false }));
}

function PatchesHistoryOnMount({
  onReplaceState,
  children,
}: {
  onReplaceState: (url: string) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const original = window.history.replaceState.bind(window.history);
    window.history.replaceState = (state, unused, url) => {
      onReplaceState(String(url));
      original(state, unused, url);
    };
    return () => {
      window.history.replaceState = original;
    };
  }, [onReplaceState]);
  return children;
}

describe('UserProfile modal return', () => {
  it.each([
    { name: 'renders normally', strict: false },
    { name: 'renders in StrictMode', strict: true },
  ])('reopens the profile on the account page and clears the param when it $name', async ({ strict }) => {
    if (strict) {
      strictMode();
    }
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount&tab=connections');

    await renderWithClerk(<p>Page</p>);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('?tab=connections');
    expect(window.location.hash).toBe('#accounts');
  });

  it('keeps the history state of the page when it clears the param', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');
    window.history.replaceState({ router: 'state' }, '');

    await renderWithClerk(<p>Page</p>);

    await screen.findByRole('dialog');
    expect(window.location.search).toBe('');
    expect(window.history.state).toEqual({ router: 'state' });
  });

  it('drops the Next.js marker when it clears the param, so the App Router syncs the new URL', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');
    window.history.replaceState({ __NA: true, router: 'state' }, '');

    await renderWithClerk(<p>Page</p>);

    await screen.findByRole('dialog');
    expect(window.location.search).toBe('');
    expect(window.history.state).toEqual({ router: 'state' });
  });

  it('clears the param through a history patch that a parent installs while mounting', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');
    const onReplaceState = vi.fn();
    const clerk = new Clerk(publishableKey());

    const tree = () => (
      <PatchesHistoryOnMount onReplaceState={onReplaceState}>
        <ClerkContextProvider
          clerk={clerk}
          clerkStatus={clerk.status}
        >
          <MosaicProvider>
            <p>Page</p>
          </MosaicProvider>
        </ClerkContextProvider>
      </PatchesHistoryOnMount>
    );
    const view = render(tree());
    await act(() => clerk.load());
    view.rerender(tree());

    await screen.findByRole('dialog');
    expect(window.location.search).toBe('');
    expect(onReplaceState).toHaveBeenCalledTimes(1);
  });

  it('keeps history state that is not a plain object when it clears the param', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');
    window.history.replaceState(['router', 'state'], '');

    await renderWithClerk(<p>Page</p>);

    await screen.findByRole('dialog');
    expect(window.location.search).toBe('');
    expect(window.history.state).toEqual(['router', 'state']);
  });

  it('keeps an array as an array when it drops the Next.js marker', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');
    window.history.replaceState(Object.assign(['router', 'state'], { __NA: true }), '');

    await renderWithClerk(<p>Page</p>);

    await screen.findByRole('dialog');
    expect(window.location.search).toBe('');
    expect(Array.isArray(window.history.state)).toBe(true);
    expect(window.history.state).toEqual(['router', 'state']);
    expect(window.history.state).not.toHaveProperty('__NA');
  });

  it('ignores an unknown value', async () => {
    serve();
    visit('?__clerk_mosaic_modal=organization-profile%2Fgeneral&tab=connections');

    await renderWithClerk(<p>Page</p>);

    expect(await screen.findByText('Page')).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(window.location.search).toBe('?__clerk_mosaic_modal=organization-profile%2Fgeneral&tab=connections');
    expect(window.location.hash).toBe('#accounts');
  });
});
