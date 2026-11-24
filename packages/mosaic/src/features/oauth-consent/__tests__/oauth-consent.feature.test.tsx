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

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
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

function visitOAuthConsent(params: Record<string, string> = {}) {
  visit({ client_id: 'client_1', scope: 'profile email', redirect_uri: REDIRECT_URI, state: 'st_1', ...params });
}

async function renderOAuthConsent(
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

function scopeCheckbox(name: string, list?: string) {
  return within(scopeList(list)).getByRole('checkbox', { name });
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
      visitOAuthConsent();
      await renderOAuthConsent();

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent(
        'Only continue if you trust Linear (example.com).',
      );
      expect(screen.getByText('Signed in as alice@example.com')).toBeVisible();
      expect(scopeLabels()).toEqual(['Your profile', 'Your email address']);
    });

    it('asks the Frontend API for the client, scope and redirect URI in the URL', async () => {
      visitOAuthConsent();
      const { fapi } = await renderOAuthConsent();

      await ready();
      const [request] = fapi.oauthConsentRequests;
      expect(request?.pathname).toBe(CONSENT_PATH);
      expect(request?.searchParams.get('scope')).toBe('profile email');
      expect(request?.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    });

    it('prefers props over the URL', async () => {
      visit({ client_id: 'client_from_url', scope: 'email', redirect_uri: 'https://url.example.com/cb' });
      const { fapi } = await renderOAuthConsent(signedIn(), {
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
      visitOAuthConsent();
      const bob = fapiUser({
        id: 'user_2',
        phone_numbers: [fapiPhoneNumber({ id: 'idn_phone', phone_number: '+15555550100' })],
        primary_phone_number_id: 'idn_phone',
      });
      await renderOAuthConsent(signedIn({ client: fapiClient([fapiSession({ id: 'sess_1', user: bob })]) }));

      await ready();
      expect(screen.getByText('Signed in as +15555550100')).toBeVisible();
    });

    it('falls back to the scope name when the scope has no description', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(signedIn({ oauthConsent: consent({ scopes: [scope('openid')] }) }));

      await ready();
      expect(scopeLabels()).toEqual(['openid']);
    });

    it('describes private metadata in its own words', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('private_metadata', 'Server description')] }) }),
      );

      await ready();
      expect(scopeLabels()).toEqual(['Your private metadata set by Acme, which may include sensitive information']);
    });

    it('localizes the private metadata description', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('private_metadata')] }) }),
        {},
        { overrides: { 'oauthConsent.privateMetadata': 'Métadonnées privées de {applicationName}' } },
      );

      await ready();
      expect(scopeLabels()).toEqual(['Métadonnées privées de Acme']);
    });

    it('lists offline access as required and says the user stays signed in', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('profile', 'Your profile'), scope('offline_access')] }) }),
      );

      await ready();
      const offline = scopeCheckbox('offline_access');
      expect(offline).toBeChecked();
      expect(offline).toBeDisabled();
      expect(within(scopeList()).getByText('Required')).toBeVisible();
      expect(screen.getByText(/You'll stay signed in until you sign out or revoke access\./)).toBeVisible();
    });

    it('lists offline access when it is the only scope', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(signedIn({ oauthConsent: consent({ scopes: [scope('offline_access')] }) }));

      await ready();
      expect(scopeCheckbox('offline_access')).toBeDisabled();
    });

    it('leaves out the offline access notice when it is not requested', async () => {
      visitOAuthConsent();
      await renderOAuthConsent();

      await ready();
      expect(screen.queryByText(/You'll stay signed in/)).toBeNull();
    });
  });

  describe('redirect domain', () => {
    it('warns about the domain the Frontend API reports, and where the user will land', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(signedIn({ oauthConsent: consent({ redirect_domain: 'linear.app' }) }));

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent(
        'Only continue if you trust Linear (linear.app).',
      );
      expect(screen.getByText(/If you allow access, this app will redirect you to/)).toHaveTextContent(
        'If you allow access, this app will redirect you to linear.app.',
      );
    });

    it('derives the domain from the redirect URI when the Frontend API reports none', async () => {
      visitOAuthConsent();
      await renderOAuthConsent();

      await ready();
      expect(screen.getByText(/Only continue if you trust/)).toHaveTextContent('(example.com)');
      expect(screen.getByText(/If you allow access, this app will redirect you to/)).toHaveTextContent('example.com');
    });

    it.each([
      ['description', /Only continue if you trust/],
      ['redirect notice', /If you allow access, this app will redirect you to/],
    ])('shows the full redirect URL from the domain in the %s', async (_, text) => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      const domain = within(screen.getByText(text)).getByRole('button', { name: 'example.com' });
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
      visitOAuthConsent();
      await renderOAuthConsent();

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
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();
      const submits = captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Allow' }));

      expect(submits).toHaveLength(1);
      const data = submits[0]?.data;
      expect(data?.get('consented')).toBe('true');
      expect(data?.get('client_id')).toBe('client_1');
      expect(data?.getAll('scope')).toEqual(['profile email']);
      expect(data?.get('redirect_uri')).toBe(REDIRECT_URI);
      expect(data?.get('state')).toBe('st_1');
    });

    it('denies with the same form', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();
      const submits = captureSubmits();

      await ready();
      await user.click(screen.getByRole('button', { name: 'Deny' }));

      expect(submits).toHaveLength(1);
      expect(submits[0]?.data.get('consented')).toBe('false');
      expect(submits[0]?.data.get('state')).toBe('st_1');
    });

    it('shows the chosen button as pending, locks the other, and submits only once', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();
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
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();
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
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes));

      await ready();
      expect(scopeLabels()).toEqual(['Your profile', 'user:org:read']);
      const select = screen.getByRole('combobox', { name: /^Grant access for:/ });
      expect(select).toHaveTextContent('Acme');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_1');
    });

    it('locks the organization once the form submits', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes));

      await ready();
      await submitAllow(user);

      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toBeDisabled();
    });

    it('defaults to the last active organization', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes, globex.id));

      await ready();
      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('Globex');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_2');
    });

    it('falls back to the first membership when the last active organization is not one', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes, 'org_gone'));

      await ready();
      expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('Acme');
      expect((await submitAllow(user))?.get('organization_id')).toBe('org_1');
    });

    it('submits every organization the user picks', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes));

      await ready();
      await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
      await user.click(await screen.findByRole('option', { name: 'Globex' }));

      expect((await submitAllow(user))?.getAll('organization_id')).toEqual(['org_1 org_2']);
    });

    it('shows each organization logo', async () => {
      visitOAuthConsent();
      const initech = fapiOrganization({ id: 'org_3', name: 'Initech', image_url: PIXEL, has_image: true });
      const bob = fapiUser({ id: 'user_2', organization_memberships: [fapiMembership(initech)] });
      const { user } = await renderOAuthConsent({
        ...orgScopes,
        client: fapiClient([fapiSession({ id: 'sess_2', user: bob, last_active_organization_id: null })]),
      });

      await ready();
      await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
      const option = await screen.findByRole('option', { name: 'Initech' });

      await waitFor(() => expect(option.querySelector('img')).toHaveAttribute('src', PIXEL));
    });

    it('does not ask when the app does not read organizations', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });

    it('does not ask when organizations are disabled', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(
        signedIn({ ...orgScopes, environment: fapiEnvironment({ organization_settings: { enabled: false } }) }),
      );

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });

    it('stops asking once the user clears organization access', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(signedIn(orgScopes));

      await ready();
      await user.click(scopeCheckbox('user:org:read'));

      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      const data = await submitAllow(user);
      expect(data?.has('organization_id')).toBe(false);
      expect(data?.get('scope')).toBe('profile');
    });

    it('does not ask when the user has no memberships', async () => {
      visitOAuthConsent();
      const loner = fapiUser({ id: 'user_3', organization_memberships: [] });
      const { user } = await renderOAuthConsent(
        signedIn({ ...orgScopes, client: fapiClient([fapiSession({ id: 'sess_1', user: loner })]) }),
      );

      await ready();
      expect(screen.queryByRole('combobox', { name: /^Grant access for:/ })).toBeNull();
      expect((await submitAllow(user))?.has('organization_id')).toBe(false);
    });
  });

  describe('choosing scopes', () => {
    async function submitAllow(user: ReturnType<typeof userEvent.setup>) {
      const submits = captureSubmits();
      await user.click(screen.getByRole('button', { name: 'Allow' }));
      return submits[0]?.data;
    }

    it('checks every requested scope', async () => {
      visitOAuthConsent();
      await renderOAuthConsent();

      await ready();
      expect(scopeCheckbox('Your profile')).toBeChecked();
      expect(scopeCheckbox('Your email address')).toBeChecked();
    });

    it('posts only the scopes the user keeps', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      await user.click(scopeCheckbox('Your email address'));

      expect(scopeCheckbox('Your email address')).not.toBeChecked();
      expect((await submitAllow(user))?.getAll('scope')).toEqual(['profile']);
    });

    it('posts a scope again once the user checks it back', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      await user.click(scopeCheckbox('Your email address'));
      await user.click(scopeCheckbox('Your email address'));

      expect((await submitAllow(user))?.getAll('scope')).toEqual(['profile email']);
    });

    it('always posts offline access', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent(
        signedIn({ oauthConsent: consent({ scopes: [scope('profile', 'Your profile'), scope('offline_access')] }) }),
      );

      await ready();
      await user.click(scopeCheckbox('Your profile'));

      expect((await submitAllow(user))?.getAll('scope')).toEqual(['offline_access']);
    });

    it('posts offline access when the user clears every scope', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      await user.click(scopeCheckbox('Your profile'));
      await user.click(scopeCheckbox('Your email address'));

      expect((await submitAllow(user))?.getAll('scope')).toEqual(['offline_access']);
    });

    it('does not forward the organization or answer from the URL', async () => {
      visitOAuthConsent({ organization_id: 'org_from_url', consented: 'false' });
      const { user } = await renderOAuthConsent();

      await ready();
      const data = await submitAllow(user);
      expect(data?.getAll('consented')).toEqual(['true']);
      expect(data?.has('organization_id')).toBe(false);
    });

    it('locks the scopes once the form submits', async () => {
      visitOAuthConsent();
      const { user } = await renderOAuthConsent();

      await ready();
      await submitAllow(user);

      expect(scopeCheckbox('Your profile')).toBeDisabled();
    });

    it('starts over when the consent request changes', async () => {
      visitOAuthConsent();
      const { user, fapi, rerender } = await renderOAuthConsent();

      await ready();
      await user.click(scopeCheckbox('Your email address'));
      fapi.oauthConsent = consent({ scopes: [scope('email', 'Your email address')] });
      rerender(<OAuthConsent scope='email' />);

      await waitFor(() => expect(scopeCheckbox('Your email address')).toBeChecked());
      expect(screen.queryByRole('checkbox', { name: 'Your profile' })).toBeNull();
    });

    it("shows a skeleton, not the previous request's scopes, while the next request loads", async () => {
      visitOAuthConsent();
      const { fapi, rerender } = await renderOAuthConsent();

      await ready();
      fapi.oauthConsent = consent({ scopes: [scope('email', 'Your email address')] });
      const held = holdRequests('get', CONSENT_PATH);
      rerender(<OAuthConsent scope='email' />);

      await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Your profile' })).toBeNull());
      expect(screen.getByRole('status')).toHaveTextContent('Loading consent information');
      held.release();
      await waitFor(() => expect(scopeCheckbox('Your email address')).toBeChecked());
    });
  });

  describe('client identity', () => {
    it('warns that a self-registered app named itself', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(signedIn({ oauthConsent: consent({ client_registration: 'dynamic' }) }));

      await ready();
      expect(screen.getByText('Linear registered itself, so its name and logo are not verified.')).toBeVisible();
    });

    it('names the application in the warning when a self-registered app has no name', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(
        signedIn({ oauthConsent: consent({ client_registration: 'dynamic', oauth_application_name: '' }) }),
      );

      expect(await screen.findByText('Acme registered itself, so its name and logo are not verified.')).toBeVisible();
    });

    it('names the host that publishes the app details', async () => {
      visitOAuthConsent();
      await renderOAuthConsent(
        signedIn({
          oauthConsent: consent({ client_registration: 'metadata_document', client_metadata_host: 'claude.ai' }),
        }),
      );

      await ready();
      expect(screen.getByText('Details published by claude.ai.')).toBeVisible();
    });

    it.each<[string, Partial<OAuthConsentInfoJSON>]>([
      ['a pre-registered app', { client_registration: 'preregistered' }],
      ['a metadata document without a host', { client_registration: 'metadata_document', client_metadata_host: null }],
      ['no registration', {}],
    ])('says nothing for %s', async (_, overrides) => {
      visitOAuthConsent();
      await renderOAuthConsent(signedIn({ oauthConsent: consent(overrides) }));

      await ready();
      expect(screen.queryByText(/registered itself/)).toBeNull();
      expect(screen.queryByText(/Details published by/)).toBeNull();
    });
  });

  describe('availability', () => {
    it('renders nothing when signed out', async () => {
      visitOAuthConsent();
      const { fapi } = await renderOAuthConsent({ oauthConsent: consent() });

      await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
      expect(screen.queryByRole('heading')).toBeNull();
      expect(fapi.oauthConsentRequests).toEqual([]);
    });

    it('renders the fallback until Clerk loads', async () => {
      visitOAuthConsent();
      serveFapi(signedIn());
      const held = holdRequests('get', '/v1/environment');
      const rendering = renderWithClerk(<OAuthConsent fallback={<p>Waiting for Clerk</p>} />);

      expect(await screen.findByText('Waiting for Clerk')).toBeVisible();
      expect(screen.queryByRole('status')).toBeNull();
      held.release();
      await rendering;
      await ready();
      expect(screen.queryByText('Waiting for Clerk')).toBeNull();
    });

    it('shows a skeleton while consent loads', async () => {
      visitOAuthConsent();
      const held = holdRequests('get', CONSENT_PATH);
      await renderOAuthConsent();

      expect(await screen.findByRole('status')).toHaveTextContent('Loading consent information');
      expect(screen.getByRole('button', { name: 'Allow' })).toBeDisabled();
      held.release();
      await ready();
      expect(screen.getByRole('status')).toHaveTextContent('Consent information loaded');
    });

    it.each([
      [true, 1],
      [false, 0],
    ])('signs the skeleton only where the instance is branded (%s)', async (branded, signatures) => {
      visitOAuthConsent();
      const held = holdRequests('get', CONSENT_PATH);
      await renderOAuthConsent(signedIn({ environment: fapiEnvironment({ display_config: { branded } }) }));

      await screen.findByRole('status');
      expect(screen.queryAllByText(/Secured by/)).toHaveLength(signatures);
      held.release();
      await ready();
    });

    it('explains a missing client ID without asking the Frontend API', async () => {
      visit({ redirect_uri: REDIRECT_URI });
      const { fapi } = await renderOAuthConsent();

      expect(await screen.findByRole('alert')).toHaveTextContent('The client ID is missing.');
      expect(fapi.oauthConsentRequests).toEqual([]);
    });

    it('explains a missing redirect URI', async () => {
      visit({ client_id: 'client_1' });
      await renderOAuthConsent();

      expect(await screen.findByRole('alert')).toHaveTextContent('The redirect URI is missing.');
    });

    it('shows why consent could not load', { timeout: 20_000 }, async () => {
      visitOAuthConsent();
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
