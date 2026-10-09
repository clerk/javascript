import type { ClientJSON, SessionJSON, UserJSON } from '@clerk/shared/types';
import { HttpResponse, type JsonBodyType } from 'msw';

export const VERIFICATION_CODE = '424242';

type ClientState = { client: ClientJSON };

export function envelope(response: JsonBodyType, client: ClientJSON | null) {
  return HttpResponse.json({ response, client });
}

export function findSession(state: ClientState, id: unknown): SessionJSON | undefined {
  return state.client.sessions.find(session => session.id === id);
}

export function error(code: string, status = 400) {
  return HttpResponse.json({ errors: [{ code, message: code, long_message: code }] }, { status });
}

export function requestUser(state: ClientState, request: Request): UserJSON | undefined {
  const sessionId = new URL(request.url).searchParams.get('_clerk_session_id') ?? state.client.last_active_session_id;
  return findSession(state, sessionId)?.user;
}

export function updateUser(state: ClientState, user: UserJSON): void {
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session => (session.user.id === user.id ? { ...session, user } : session)),
  };
}

export function missing() {
  return HttpResponse.json({ errors: [{ code: 'resource_not_found', message: 'not found' }] }, { status: 404 });
}
