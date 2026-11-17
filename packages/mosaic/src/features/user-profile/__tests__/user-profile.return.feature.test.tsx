import { configure, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { MosaicProfile } from '../../profile-pages/use-mosaic-profile';
import { UserProfile } from '../user-profile';
import { signedIn } from '../user-profile-connected-accounts-section/__tests__/user-profile-connected-accounts.fixtures';

beforeAll(async () => {
  await import('../user-profile.modal-content');
  await import('../../profile/profile.modal-content');
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

describe('UserProfile return after a redirect', () => {
  it.each([
    { name: 'renders normally', strict: false },
    { name: 'renders in StrictMode', strict: true },
  ])('reopens the profile modal on the page it names and removes the param when it $name', async ({ strict }) => {
    if (strict) {
      strictMode();
    }
    serve();
    visit('?.modal.user=security&tab=connections');

    await renderWithClerk(<p>Page</p>);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('?tab=connections');
    expect(window.location.hash).toBe('#accounts');
  });

  it('reopens the combined profile modal on the page it names', async () => {
    serve();
    visit('?.modal.profile=security');

    await renderWithClerk(<p>Page</p>);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('');
  });

  it('shows an inline profile on the page it names', async () => {
    serve();
    visit('?.user=security');

    await renderWithClerk(<UserProfile />);

    const tab = await screen.findByRole('tab', { name: 'Security' });
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
    expect(window.location.search).toBe('');
  });

  it('sends a connection from an inline profile back to its account page', async () => {
    serveFapi(signedIn([]));
    visit('?tab=connections');
    await renderWithClerk(<UserProfile />);
    const request = holdRequests('post', '/v1/me/external_accounts');

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    const returned = new URL(body.get('redirect_url') || '');
    expect(returned.searchParams.get('.user')).toBe('account');
    expect(returned.searchParams.get('tab')).toBe('connections');
    expect(returned.hash).toBe('#accounts');
    request.fail();
  });

  describe("with the provider's profile", () => {
    const memberships = [fapiMembership(fapiOrganization({ id: 'org_1', name: 'Acme' }))];

    function serveInOrganization() {
      serveFapi({
        environment: fapiEnvironment(),
        client: fapiClient([
          fapiSession({
            id: 'sess_1',
            user: fapiUser({ id: 'user_1', organization_memberships: memberships }),
            last_active_organization_id: 'org_1',
          }),
        ]),
        memberships,
      });
    }

    async function tabsAfterReturning(profile: MosaicProfile) {
      serveInOrganization();
      visit('?.modal.user=account');

      await renderWithClerk(<p>Page</p>, undefined, undefined, undefined, profile);

      const dialog = await screen.findByRole('dialog');
      await within(dialog).findByRole('tab', { name: 'Account' });
      return within(dialog)
        .getAllByRole('tab')
        .map(tab => tab.textContent);
    }

    it('keeps the custom pages', async () => {
      const tabs = await tabsAfterReturning({
        userProfileProps: { customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }] },
      });

      expect(tabs).toContain('Terms');
    });

    it('stays account-only when the provider turns combined off', async () => {
      const tabs = await tabsAfterReturning({ combined: false });

      expect(tabs).not.toContain('General');
    });
  });
});
