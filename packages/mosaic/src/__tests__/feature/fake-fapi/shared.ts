import { HttpResponse, type JsonBodyType } from 'msw';

import type { FapiClient, FapiSession, FapiUser } from '../fapi';

export const VERIFICATION_CODE = '424242';

type ClientState = { client: FapiClient };

export function envelope(response: JsonBodyType, client: FapiClient | null) {
  return HttpResponse.json({ response, client });
}

export function findSession(state: ClientState, id: unknown): FapiSession | undefined {
  return state.client.sessions.find(session => session.id === id);
}

export function error(code: string, status = 400) {
  return HttpResponse.json({ errors: [{ code, message: code, long_message: code }] }, { status });
}

export function requestUser(state: ClientState, request: Request): FapiUser | undefined {
  const sessionId = new URL(request.url).searchParams.get('_clerk_session_id') ?? state.client.last_active_session_id;
  return findSession(state, sessionId)?.user;
}

export function updateUser(state: ClientState, user: FapiUser): void {
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session => (session.user.id === user.id ? { ...session, user } : session)),
  };
}

export function missing() {
  return HttpResponse.json(
    { errors: [{ code: 'resource_not_found', message: 'not found', long_message: 'not found' }] },
    { status: 404 },
  );
}

const paginationParams = ['limit', 'offset', 'paginated'];

export function rejectUnknownParams(url: URL, allowed: readonly string[]) {
  const unknown = [...url.searchParams.keys()].find(
    key => !key.startsWith('_') && !paginationParams.includes(key) && !allowed.includes(key),
  );
  return unknown
    ? HttpResponse.json(
        {
          errors: [
            {
              code: 'form_param_unknown',
              message: `${unknown} is not a valid parameter for this request.`,
              long_message: `${unknown} is not a valid parameter for this request.`,
              meta: { param_name: unknown },
            },
          ],
        },
        { status: 422 },
      )
    : undefined;
}
