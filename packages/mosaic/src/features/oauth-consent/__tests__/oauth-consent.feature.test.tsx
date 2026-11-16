import type { OAuthConsentInfoJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, onTestFinished } from 'vitest';

import { openDialog } from '../../../__tests__/feature/dialog';
import { type FakeFapiSeed, fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiMembership,
  fapiOAuthConsentInfo,
  fapiOrganization,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { MosaicLocalization } from '../../../localization';
import type { OAuthConsentProps } from '../oauth-consent';
import { OAuthConsent } from '../oauth-consent';

const REDIRECT_URI = 'https://app.linear.example.com/oauth/callback';
const CONSENT_PATH = '/v1/me/oauth/consent/client_1';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });
const globex = fapiOrganization({ id: 'org_2', name: 'Globex' });

const alice = fapiUser({
  id: 'user_1',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: [fapiMembership(acme), fapiMembership(globex)],
});

const scope = (name: string, description: string | null = null) => ({
  scope: name,
  description,
  requires_consent: true,
});

function consent(overrides: Partial<OAuthConsentInfoJSON> = {}) {
  return fapiOAuthConsentInfo({
    client_id: 'client_1',
    scopes: [scope('profile', 'Your profile'), scope('email', 'Your email address')],
    ...overrides,
  });
}

function signedIn(overrides: FakeFapiSeed = {}, lastActiveOrganizationId: string | null = null): FakeFapiSeed {
  return {
    client: fapiClient([
      fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: lastActiveOrganizationId }),
    ]),
    oauthConsent: consent(),
    ...overrides,
  };
}

function visit(params: Record<string, string>) {
  const previous = window.location.href;
  window.history.replaceState(null, '', `?${new URLSearchParams(params).toString()}`);
  onTestFinished(() => window.history.replaceState(null, '', previous));
}

function visitConsent(params: Record<string, string> = {}) {
  visit({ client_id: 'client_1', scope: 'profile email', redirect_uri: REDIRECT_URI, state: 'st_1', ...params });
}

async function renderConsent(
  seed: FakeFapiSeed = signedIn(),
  props: Partial<OAuthConsentProps> = {},
  localization?: MosaicLocalization,
) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<OAuthConsent {...props} />, undefined, localization);
  return { ...view, fapi, user: userEvent.setup() };
}

async function ready(name = 'Linear would like to access your Acme account') {
  return screen.findByRole('heading', { name });
}

function scopeList(name = 'Linear') {
  return screen.getByRole('list', { name: `This will allow ${name} access to:` });
}

function scopeLabels(name?: string) {
  return within(scopeList(name))
    .getAllByRole('listitem')
    .map(item => item.textContent);
}

function captureSubmits() {
  const submits: { action: string; method: string; data: FormData }[] = [];
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (event.target instanceof HTMLFormElement) {
      submits.push({
        action: event.target.action,
        method: event.target.method,
        data: new FormData(event.target, event.submitter),
      });
    }
  };
  document.addEventListener('submit', onSubmit);
  onTestFinished(() => document.removeEventListener('submit', onSubmit));
  return submits;
}

describe('OAuthConsent', () => {
  describe('consent screen', () => {
    it('names the app and who is granting access, and lists the requested scopes', async () => {
      visitConsent();
      await renderConsent();

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent(
        'Only continue if you trust Linear (example.com).',
      );
      expect(screen.getByText('Signed in as alice@example.com')).toBeVisible();
      expect(scopeLabels()).toEqual(['Your profile', 'Your email address']);
    });

    it('asks the Frontend API for the client, scope and redirect URI in the URL', async () => {
      visitConsent();
      const { fapi } = await renderConsent();

      await ready();
      const [request] = fapi.oauthConsentRequests;
      expect(request?.pathname).toBe(CONSENT_PATH);
      expect(request?.searchParams.get('scope')).toBe('profile email');
      expect(request?.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    });

    it('prefers props over the URL', async () => {
      visit({ client_id: 'client_from_url', scope: 'email', redirect_uri: 'https://url.example.com/cb' });
      const { fapi } = await renderConsent(signedIn(), {
        oauthClientId: 'client_1',
        scope: 'profile',
        redirectUrl: REDIRECT_URI,
      });

      await ready();
      const [request] = fapi.oauthConsentRequests;
      expect(request?.pathname).toBe(CONSENT_PATH);
      expect(request?.searchParams.get('scope')).toBe('profile');
      expect(request?.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    });

    it('names the user by phone number when they have no email address', async () => {
      visitConsent();
      const bob = fapiUser({
        id: 'user_2',
        phone_numbers: [fapiPhoneNumber({ id: 'idn_phone', phone_number: '+15555550100' })],
        primary_phone_number_id: 'idn_phone',
      });
      await renderConsent(signedIn({ client: fapiClient([fapiSession({ id: 'sess_1', user: bob })]) }));

      await ready();
      expect(screen.getByText('Signed in as +15555550100')).toBeVisible();
    });

    it('falls back to the scope name when the scope has no description', async () => {
      visitConsent();
      await renderConsent(signedIn({ oauthConsent: consent({ scopes: [scope('openid')] }) }));

      await ready();
      expect(scopeLabels()).toEqual(['openid']);
    });

    it('describes private metadata in its own words', async () => {
      visitConsent();
      await renderConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('private_metadata', 'Server description')] }) }),
      );

      await ready();
      expect(scopeLabels()).toEqual(['Your private metadata set by Acme, which may include sensitive information']);
    });

    it('localizes the private metadata description', async () => {
      visitConsent();
      await renderConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('private_metadata')] }) }),
        {},
        { overrides: { 'oauthConsent.privateMetadata': 'Métadonnées privées de {applicationName}' } },
      );

      await ready();
      expect(scopeLabels()).toEqual(['Métadonnées privées de Acme']);
    });

    it('keeps offline access out of the list and says the user stays signed in', async () => {
      visitConsent();
      await renderConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('profile', 'Your profile'), scope('offline_access')] }) }),
      );

      await ready();
      expect(scopeLabels()).toEqual(['Your profile']);
      expect(screen.getByText(/You'll stay signed in until you sign out or revoke access\./)).toBeVisible();
    });

    it('hides the scope list when offline access is the only scope', async () => {
      visitConsent();
      await renderConsent(signedIn({ oauthConsent: consent({ scopes: [scope('offline_access')] }) }));

      await ready();
      expect(screen.queryByRole('list')).toBeNull();
    });

    it('leaves out the offline access notice when it is not requested', async () => {
      visitConsent();
      await renderConsent();

      await ready();
      expect(screen.queryByText(/You'll stay signed in/)).toBeNull();
    });
  });

  describe('redirect domain', () => {
    it('warns about the domain the Frontend API reports, and where the user will land', async () => {
      visitConsent();
      await renderConsent(signedIn({ oauthConsent: consent({ redirect_domain: 'linear.app' }) }));

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent(
        'Only continue if you trust Linear (linear.app).',
      );
      expect(screen.getByText(/If you allow access, this app will redirect you to/)).toHaveTextContent(
        'If you allow access, this app will redirect you to linear.app.',
      );
    });

    it('derives the domain from the redirect URI when the Frontend API reports none', async () => {
      visitConsent();
      await renderConsent();

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent('(example.com)');
      expect(screen.getByRole('button', { name: 'example.com' })).toBeVisible();
    });

    it('shows the full redirect URL from the domain', async () => {
      visitConsent();
      const { user } = await renderConsent();

      await ready();
      const domain = screen.getByRole('button', { name: 'example.com' });
      await user.hover(domain);
      expect(await screen.findByRole('tooltip')).toHaveTextContent('View full URL');

      const dialog = await openDialog(user, domain, { name: 'Redirect URL' });
      expect(dialog).toHaveTextContent('Make sure you trust Linear and that this URL belongs to Linear.');
      const url = within(dialog).getByRole('textbox', { name: 'Redirect URL' });
      expect(url).toHaveValue(REDIRECT_URI);
      expect(url).toHaveAttribute('readonly');
    });
  });

  describe('submitting', () => {
    it('posts one form to the consent endpoint for the signed-in session', async () => {
      visitConsent();
      await renderConsent();

      await ready();
      const forms = document.querySelectorAll('form');
      expect(forms).toHaveLength(1);
      const [form] = forms;
      expect(form?.method).toBe('post');
      const action = new URL(form?.action ?? '');
      expect(action.pathname).toBe(CONSENT_PATH);
      expect(action.searchParams.get('_clerk_session_id')).toBe('sess_1');
    });

    it('allows with every URL parameter forwarded', async () => {
      visitConsent();
      const { user } = await renderConsent();
      const submits = captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Allow' }));

      expect(submits).toHaveLength(1);
      const data = submits[0]?.data;
      expect(data?.get('consented')).toBe('true');
      expect(data?.get('client_id')).toBe('client_1');
      expect(data?.get('scope')).toBe('profile email');
      expect(data?.get('redirect_uri')).toBe(REDIRECT_URI);
      expect(data?.get('state')).toBe('st_1');
    });

    it('denies with the same form', async () => {
      visitConsent();
      const { user } = await renderConsent();
      const submits = captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Deny' }));

      expect(submits).toHaveLength(1);
      expect(submits[0]?.data.get('consented')).toBe('false');
      expect(submits[0]?.data.get('state')).toBe('st_1');
    });

    it('shows the chosen button as pending, locks the other, and submits only once', async () => {
      visitConsent();
      const { user } = await renderConsent();
      const submits = captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Allow' }));
      await user.keyboard('{Enter}');

      expect(submits).toHaveLength(1);
      expect(submits[0]?.data.get('consented')).toBe('true');
      expect(screen.getByRole('button', { name: 'Allow' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button', { name: 'Deny' })).toBeDisabled();
    });

    it('unlocks when the browser restores the page from history', async () => {
      visitConsent();
      const { user } = await renderConsent();
      captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Deny' }));
      act(() => {
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      });

      expect(screen.getByRole('button', { name: 'Allow' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Deny' })).not.toHaveAttribute('aria-busy');
    });
  });

  describe('organization', () => {
    const orgScopes = { oauthConsent: consent({ scopes: [scope('profile', 'Your profile'), scope('user:org:read')] }) };

    async function submitAllow(user: ReturnType<typeof userEvent.setup>) {
      const submits = captureSubmits();
      await user.click(screen.getByRole('button', { name: 'Allow' }));
      return submits[0]?.data;
    }

    it('asks which organization to share when the app reads organizations', async () => {
      visitConsent();
      const { user } = await renderConsent(signedIn(orgScopes));

      await ready();
      expect(scopeLabels()).toEqual(['Your profile', 'user:org:read']);
      const select = screen.getByRole('combobox', { name: /^Grant access for:/ });
      expect(select).toHaveTextContent('Acme');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_1');
    });

    it('locks the organization once the form submits', async () => {
      visitConsent();
      const { user } = await renderConsent(signedIn(orgScopes));

      await ready();
      await submitAllow(user);

      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toBeDisabled();
    });

    it('defaults to the last active organization', async () => {
      visitConsent();
      const { user } = await renderConsent(signedIn(orgScopes, globex.id));

      await ready();
      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('Globex');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_2');
    });

    it('falls back to the first membership when the last active organization is not one', async () => {
      visitConsent();
      const { user } = await renderConsent(signedIn(orgScopes, 'org_gone'));

      await ready();
      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('Acme');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_1');
    });

    it('submits the organization the user picks', async () => {
      visitConsent();
      const { user } = await renderConsent(signedIn(orgScopes));

      await ready();
      await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
      await user.click(await screen.findByRole('option', { name: 'Globex' }));

      expect((await submitAllow(user))?.get('organization_id')).toBe('org_2');
    });

    it('does not ask when the app does not read organizations', async () => {
      visitConsent();
      const { user } = await renderConsent();

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });

    it('does not ask when organizations are disabled', async () => {
      visitConsent();
      const { user } = await renderConsent(
        signedIn({ ...orgScopes, environment: fapiEnvironment({ organization_settings: { enabled: false } }) }),
      );

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });

    it('does not ask when the user has no memberships', async () => {
      visitConsent();
      const loner = fapiUser({ id: 'user_3', organization_memberships: [] });
      const { user } = await renderConsent(
        signedIn({ ...orgScopes, client: fapiClient([fapiSession({ id: 'sess_1', user: loner })]) }),
      );

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });
  });

  describe('availability', () => {
    it('renders nothing when signed out', async () => {
      visitConsent();
      const { fapi } = await renderConsent({ oauthConsent: consent() });

      await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
      expect(screen.queryByRole('heading')).toBeNull();
      expect(fapi.oauthConsentRequests).toEqual([]);
    });

    it('shows a skeleton while consent loads', async () => {
      visitConsent();
      const held = holdRequests('get', CONSENT_PATH);
      await renderConsent();

      expect(await screen.findByRole('status')).toHaveTextContent('Loading consent information');
      expect(screen.getByRole('button', { name: 'Allow' })).toBeDisabled();
      held.release();
      await ready();
      expect(screen.getByRole('status')).toHaveTextContent('Consent information loaded');
    });

    it('explains a missing client ID without asking the Frontend API', async () => {
      visit({ redirect_uri: REDIRECT_URI });
      const { fapi } = await renderConsent();

      expect(await screen.findByRole('alert')).toHaveTextContent('The client ID is missing.');
      expect(fapi.oauthConsentRequests).toEqual([]);
    });

    it('explains a missing redirect URI', async () => {
      visit({ client_id: 'client_1' });
      await renderConsent();

      expect(await screen.findByRole('alert')).toHaveTextContent('The redirect URI is missing.');
    });

    it('shows why consent could not load', { timeout: 20_000 }, async () => {
      visitConsent();
      serveFapi(signedIn());
      worker.use(
        http.get(fapiUrl(CONSENT_PATH), () =>
          HttpResponse.json(
            { errors: [{ code: 'oauth_consent_error', message: 'Consent metadata unavailable' }] },
            { status: 400 },
          ),
        ),
      );
      await renderWithClerk(<OAuthConsent />);

      expect(await screen.findByRole('alert', undefined, { timeout: 15_000 })).toHaveTextContent(
        'Consent metadata unavailable',
      );
      expect(screen.queryByRole('button', { name: 'Allow' })).toBeNull();
    });
  });
});
