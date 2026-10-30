import { configure, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';

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
