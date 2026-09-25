import type {
  ClientJSON,
  OrganizationMembershipJSON,
  OrganizationSuggestionJSON,
  SessionJSON,
  UserOrganizationInvitationJSON,
} from '@clerk/shared/types';
import { http, HttpResponse, type JsonBodyType } from 'msw';
import { setupWorker } from 'msw/browser';

import { fapiClient, type FapiEnvironment, fapiEnvironment, fapiPage, fapiToken } from './fapi';

export const PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
const FAPI = 'https://clerk.abcef.12345.prod.lclclerk.com';

export const fapiUrl = (path: string) => `${FAPI}${path}`;

export interface FakeFapiState {
  environment: FapiEnvironment;
  client: ClientJSON;
  memberships: OrganizationMembershipJSON[];
  invitations: UserOrganizationInvitationJSON[];
  suggestions: OrganizationSuggestionJSON[];
}

export type FakeFapiSeed = Partial<FakeFapiState>;

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

function envelope(response: JsonBodyType, client: ClientJSON | null) {
  return HttpResponse.json({ response, client });
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

function findSession(state: FakeFapiState, id: unknown): SessionJSON | undefined {
  return state.client.sessions.find(session => session.id === id);
}

function missing() {
  return HttpResponse.json({ errors: [{ code: 'resource_not_found', message: 'not found' }] }, { status: 404 });
}

export function serveFapi(seed: FakeFapiSeed = {}): FakeFapiState {
  const state: FakeFapiState = {
    environment: fapiEnvironment(),
    client: fapiClient(),
    memberships: [],
    invitations: [],
    suggestions: [],
    ...seed,
  };

  worker.use(
    http.get(fapiUrl('/v1/environment'), () => HttpResponse.json(state.environment)),
    http.get(fapiUrl('/v1/client'), () => envelope(state.client, null)),
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
    http.post(fapiUrl('/v1/me/organization_invitations/:id/accept'), ({ params }) => {
      const invitation = state.invitations.find(i => i.id === params.id);
      if (!invitation) {
        return missing();
      }
      const accepted = { ...invitation, status: 'accepted' as const };
      state.invitations = state.invitations.map(i => (i.id === accepted.id ? accepted : i));
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
  );

  return state;
}

export interface HeldRequests {
  requests: Request[];
  release: () => void;
  fail: (code?: string) => void;
}

export function holdRequests(method: 'get' | 'post', path: string): HeldRequests {
  const requests: Request[] = [];
  let settle: (response: Response | undefined) => void = () => {};
  const gate = new Promise<Response | undefined>(resolve => {
    settle = resolve;
  });

  worker.use(
    http[method](fapiUrl(path), ({ request }) => {
      requests.push(request.clone());
      return gate;
    }),
  );

  return {
    requests,
    release: () => settle(undefined),
    fail: (code = 'form_param_invalid') =>
      settle(HttpResponse.json({ errors: [{ code, message: code, long_message: code }] }, { status: 400 })),
  };
}
