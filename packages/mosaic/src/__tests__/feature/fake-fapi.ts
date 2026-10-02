import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type {
  ApiKeyJSON,
  ClientJSON,
  EnterpriseConnectionJSON,
  OAuthProvider,
  OrganizationMembershipJSON,
  OrganizationSuggestionJSON,
  SessionJSON,
  UserJSON,
  UserOrganizationInvitationJSON,
} from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import { enterpriseHandlers, type FakeEnterpriseLinking } from './fake-fapi/enterprise';
import { type FakePasskeysSeed, passkeyHandlers } from './fake-fapi/passkeys';
import { envelope, error, findSession, missing, updateUser } from './fake-fapi/shared';
import {
  createVerificationState,
  type FakeVerificationSeed,
  type FakeVerificationState,
  verificationHandlers,
} from './fake-fapi/verification';
import {
  fapiApiKey,
  fapiClient,
  type FapiEnvironment,
  fapiEnvironment,
  fapiExternalAccount,
  fapiMembership,
  fapiOrganization,
  fapiPage,
  fapiToken,
  fapiVerification,
} from './fapi';

export const PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
const FAPI = 'https://clerk.abcef.12345.prod.lclclerk.com';

export const fapiUrl = (path: string) => `${FAPI}${path}`;

export interface FakeFapiState {
  environment: FapiEnvironment;
  client: ClientJSON;
  memberships: OrganizationMembershipJSON[];
  invitations: UserOrganizationInvitationJSON[];
  suggestions: OrganizationSuggestionJSON[];
  apiKeys: ApiKeyJSON[];
  verification: FakeVerificationState;
  passwordUpdates: URLSearchParams[];
  enterpriseConnections: EnterpriseConnectionJSON[];
  enterpriseLinking: FakeEnterpriseLinking;
}

export type FakeFapiSeed = Partial<Omit<FakeFapiState, 'verification' | 'enterpriseLinking'>> & {
  verification?: FakeVerificationSeed;
  enterpriseLinking?: Partial<FakeEnterpriseLinking>;
  passkeys?: FakePasskeysSeed;
};

const unhandled: string[] = [];

export const worker = setupWorker();

export function startWorker() {
  return worker.start({
    quiet: true,
    onUnhandledRequest: request => {
      if (new URL(request.url).origin === FAPI) {
        unhandled.push(`${request.method} ${request.url}`);
      }
    },
  });
}

export function takeUnhandledRequests(): string[] {
  return unhandled.splice(0);
}

function page<T>(items: T[], url: URL) {
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const limit = Number(url.searchParams.get('limit') ?? items.length);
  return fapiPage(items.slice(offset, offset + limit), items.length);
}

function withStatus<T extends { status: string }>(items: T[], url: URL): T[] {
  const statuses = url.searchParams.getAll('status').flatMap(status => status.split(','));
  return statuses.length ? items.filter(item => statuses.includes(item.status)) : items;
}

function activeUser(state: FakeFapiState): UserJSON | undefined {
  return findSession(state, state.client.last_active_session_id)?.user;
}

function requestUser(state: FakeFapiState, request: Request): UserJSON | undefined {
  const sessionId = new URL(request.url).searchParams.get('_clerk_session_id') ?? state.client.last_active_session_id;
  return findSession(state, sessionId)?.user;
}


function withoutOrganization(session: SessionJSON, organizationId: string): SessionJSON {
  return {
    ...session,
    user: {
      ...session.user,
      organization_memberships: session.user.organization_memberships.filter(m => m.organization.id !== organizationId),
    },
  };
}

function leaveOrganization(state: FakeFapiState, organizationId: string, userId: string): void {
  state.memberships = state.memberships.filter(m => m.organization.id !== organizationId);
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session =>
      session.user.id === userId ? withoutOrganization(session, organizationId) : session,
    ),
  };
}

function deleteOrganization(state: FakeFapiState, organizationId: string): void {
  state.memberships = state.memberships.filter(m => m.organization.id !== organizationId);
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session => withoutOrganization(session, organizationId)),
  };
}


export function serveFapi(seed: FakeFapiSeed = {}): FakeFapiState {
  const { verification, enterpriseLinking, passkeys, ...rest } = seed;
  const state: FakeFapiState = {
    environment: fapiEnvironment(),
    client: fapiClient(),
    memberships: [],
    invitations: [],
    suggestions: [],
    apiKeys: [],
    passwordUpdates: [],
    enterpriseConnections: [],
    ...rest,
    verification: createVerificationState(verification),
    enterpriseLinking: {
      enabled: false,
      preparations: {},
      verifiedLinks: [],
      pendingExternalAccounts: [],
      ...enterpriseLinking,
    },
  };

  worker.use(
    ...verificationHandlers(state, fapiUrl),
    ...enterpriseHandlers(state, fapiUrl),
    ...passkeyHandlers(state, fapiUrl, passkeys),
    http.get(fapiUrl('/v1/environment'), () => HttpResponse.json(state.environment)),
    http.get(fapiUrl('/v1/client'), () => envelope(state.client, null)),
    http.get(fapiUrl('/v1/me'), () => {
      const user = activeUser(state);
      return user ? envelope(user, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/external_accounts'), async ({ request }) => {
      const user = activeUser(state);
      if (!user) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const strategy = body.get('strategy');
      if (!strategy) {
        return missing();
      }
      const provider: OAuthProvider | undefined = OAUTH_PROVIDERS.find(item => item.strategy === strategy)?.provider;
      if (!provider) {
        return missing();
      }
      const account = fapiExternalAccount({
        id: `idn_${crypto.randomUUID()}`,
        approved_scopes: '',
        provider,
        verification: fapiVerification(strategy, {
          status: 'unverified',
          external_verification_redirect_url: 'https://accounts.example/authorize',
        }),
      });
      updateUser(state, {
        ...user,
        external_accounts: [
          ...user.external_accounts.filter(
            item => item.provider !== provider || item.verification?.status === 'verified',
          ),
          account,
        ],
      });
      return envelope(account, state.client);
    }),
    http.post(fapiUrl('/v1/me/external_accounts/:id/reauthorize'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const user = activeUser(state);
      const account = user?.external_accounts.find(item => item.id === params.id);
      if (!user || !account) {
        return missing();
      }
      const pending = {
        ...account,
        verification: fapiVerification(`oauth_${account.provider}`, {
          status: 'unverified',
          external_verification_redirect_url: 'https://accounts.example/consent',
        }),
      };
      updateUser(state, {
        ...user,
        external_accounts: user.external_accounts.map(item => (item.id === pending.id ? pending : item)),
      });
      return envelope(pending, state.client);
    }),
    http.post(fapiUrl('/v1/me/external_accounts/:id'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const user = activeUser(state);
      const account = user?.external_accounts.find(item => item.id === params.id);
      if (!user || !account) {
        return missing();
      }
      updateUser(state, { ...user, external_accounts: user.external_accounts.filter(item => item.id !== account.id) });
      return envelope({ ...account, object: 'external_account' }, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/tokens'), ({ params }) => {
      const session = findSession(state, params.id);
      return session
        ? HttpResponse.json(
            fapiToken({ sid: session.id, sub: session.user.id, org_id: session.last_active_organization_id }),
          )
        : missing();
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/touch'), async ({ params, request }) => {
      const session = findSession(state, params.id);
      if (!session) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const organizationId = body.get('active_organization_id') || null;
      const touched = {
        ...session,
        last_active_organization_id: organizationId,
        last_active_token: fapiToken({ sid: session.id, sub: session.user.id, org_id: organizationId }),
      };
      state.client = {
        ...state.client,
        last_active_session_id: touched.id,
        sessions: state.client.sessions.map(s => (s.id === touched.id ? touched : s)),
      };
      return envelope(touched, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/remove'), ({ params }) => {
      const session = findSession(state, params.id);
      if (!session) {
        return missing();
      }
      const sessions = state.client.sessions.filter(s => s.id !== session.id);
      state.client = { ...state.client, sessions, last_active_session_id: sessions[0]?.id ?? null };
      return envelope({ ...session, status: 'removed' }, state.client);
    }),
    http.post(fapiUrl('/v1/me/change_password'), async ({ request }) => {
      const session = findSession(state, state.client.last_active_session_id);
      if (!session) {
        return missing();
      }
      state.passwordUpdates.push(new URLSearchParams(await request.text()));
      const updatedUser = { ...session.user, password_enabled: true };
      state.client = {
        ...state.client,
        sessions: state.client.sessions.map(item => (item.id === session.id ? { ...item, user: updatedUser } : item)),
      };
      return envelope(updatedUser, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions'), ({ request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      state.client = { ...state.client, sessions: [], last_active_session_id: null };
      return envelope(state.client, state.client);
    }),
    http.get(fapiUrl('/v1/me/organization_memberships'), ({ request }) =>
      envelope(page(state.memberships, new URL(request.url)), null),
    ),
    http.get(fapiUrl('/v1/me/organization_invitations'), ({ request }) => {
      const url = new URL(request.url);
      return envelope(page(withStatus(state.invitations, url), url), null);
    }),
    http.get(fapiUrl('/v1/me/organization_suggestions'), ({ request }) => {
      const url = new URL(request.url);
      return envelope(page(withStatus(state.suggestions, url), url), null);
    }),
    http.post(fapiUrl('/v1/me/organization_memberships/:organizationId'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const user = activeUser(state);
      const membership = state.memberships.find(m => m.organization.id === params.organizationId);
      if (!user || !membership) {
        return missing();
      }
      leaveOrganization(state, membership.organization.id, user.id);
      return envelope({ object: 'organization_membership', id: membership.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const membership = state.memberships.find(m => m.organization.id === params.organizationId);
      if (!membership) {
        return missing();
      }
      deleteOrganization(state, membership.organization.id);
      return envelope({ object: 'organization', id: membership.organization.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/me/organization_invitations/:id/accept'), ({ params }) => {
      const invitation = state.invitations.find(i => i.id === params.id);
      if (!invitation) {
        return missing();
      }
      const accepted = { ...invitation, status: 'accepted' as const };
      state.invitations = state.invitations.map(i => (i.id === accepted.id ? accepted : i));
      state.memberships = [...state.memberships, fapiMembership(fapiOrganization(invitation.public_organization_data))];
      return envelope(accepted, state.client);
    }),
    http.post(fapiUrl('/v1/me/organization_suggestions/:id/accept'), ({ params }) => {
      const suggestion = state.suggestions.find(s => s.id === params.id);
      if (!suggestion) {
        return missing();
      }
      const accepted = { ...suggestion, status: 'accepted' as const };
      state.suggestions = state.suggestions.map(s => (s.id === accepted.id ? accepted : s));
      return envelope(accepted, state.client);
    }),
    http.get(fapiUrl('/api_keys'), ({ request }) => {
      const url = new URL(request.url);
      const subject = url.searchParams.get('subject');
      const query = (url.searchParams.get('query') ?? '').toLowerCase();
      const keys = state.apiKeys.filter(
        key => !key.revoked && key.subject === subject && key.name.toLowerCase().includes(query),
      );
      return HttpResponse.json(page(keys, url));
    }),
    http.post(fapiUrl('/api_keys'), async ({ request }) => {
      const body: { name: string; subject: string; seconds_until_expiration?: number } = await request.json();
      if (state.apiKeys.some(key => !key.revoked && key.subject === body.subject && key.name === body.name)) {
        return error('token_creation_conflict', 409);
      }
      const now = Date.now();
      const created = fapiApiKey({
        id: `ak_${state.apiKeys.length + 1}`,
        name: body.name,
        subject: body.subject,
        expiration: body.seconds_until_expiration ? now + body.seconds_until_expiration * 1000 : null,
        created_at: now,
        updated_at: now,
      });
      state.apiKeys = [created, ...state.apiKeys];
      return HttpResponse.json({ ...created, secret: `ak_secret_${created.id}` });
    }),
    http.post(fapiUrl('/api_keys/:id/revoke'), ({ params }) => {
      const key = state.apiKeys.find(k => k.id === params.id);
      if (!key) {
        return missing();
      }
      const revoked = { ...key, revoked: true };
      state.apiKeys = state.apiKeys.map(k => (k.id === revoked.id ? revoked : k));
      return HttpResponse.json(revoked);
    }),
  );

  return state;
}

export interface HeldRequests {
  requests: Request[];
  release: () => void;
  fail: (code?: string, longMessage?: string, paramName?: string) => void;
}

interface Hold {
  name: string;
  release: () => void;
}

const unsettledHolds = new Set<Hold>();

export function takeUnsettledHolds(): string[] {
  const holds = [...unsettledHolds];
  unsettledHolds.clear();
  for (const hold of holds) {
    hold.release();
  }
  return holds.map(hold => hold.name);
}

export function holdRequests(method: 'get' | 'post', path: string): HeldRequests {
  const requests: Request[] = [];
  let resolveGate: (response: Response | undefined) => void = () => {};
  const gate = new Promise<Response | undefined>(resolve => {
    resolveGate = resolve;
  });
  const hold: Hold = { name: `${method.toUpperCase()} ${path}`, release: () => resolveGate(undefined) };
  const settle = (response: Response | undefined) => {
    unsettledHolds.delete(hold);
    resolveGate(response);
  };
  unsettledHolds.add(hold);

  worker.use(
    http[method](fapiUrl(path), ({ request }) => {
      requests.push(request.clone());
      return gate;
    }),
  );

  return {
    requests,
    release: () => settle(undefined),
    fail: (code = 'form_param_invalid', longMessage = code, paramName?: string) =>
      settle(
        HttpResponse.json(
          {
            errors: [
              {
                code,
                message: code,
                long_message: longMessage,
                ...(paramName ? { meta: { param_name: paramName } } : {}),
              },
            ],
          },
          { status: 400 },
        ),
      ),
  };
}
