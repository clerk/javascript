import type {
  ClientJSON,
  OrganizationInvitationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  UserJSON,
} from '@clerk/shared/types';
import { HttpResponse, type JsonBodyType } from 'msw';

import { fapiError } from './errors';

export const VERIFICATION_CODE = '424242';

type ClientState = { client: ClientJSON };

type ServedState = ClientState & {
  organizationInvitations: Array<Pick<OrganizationInvitationJSON, 'organization_id' | 'status'>>;
};

export function servedMembership(
  state: ServedState,
  membership: OrganizationMembershipJSON,
): OrganizationMembershipJSON {
  const pending = state.organizationInvitations.filter(
    invitation => invitation.organization_id === membership.organization.id && invitation.status === 'pending',
  );
  return { ...membership, organization: { ...membership.organization, pending_invitations_count: pending.length } };
}

export function servedClient(state: ServedState): ClientJSON {
  return {
    ...state.client,
    sessions: state.client.sessions.map(session => ({
      ...session,
      user: {
        ...session.user,
        organization_memberships: session.user.organization_memberships.map(membership =>
          servedMembership(state, membership),
        ),
      },
    })),
  };
}

export function envelope(response: JsonBodyType, state: ServedState) {
  return HttpResponse.json({ response, client: servedClient(state) });
}

export function findSession(state: ClientState, id: unknown): SessionJSON | undefined {
  return state.client.sessions.find(session => session.id === id);
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

const paginationParams = ['limit', 'offset', 'paginated'];

export function rejectUnknownParams(url: URL, allowed: readonly string[]) {
  const unknown = [...url.searchParams.keys()].find(
    key => !key.startsWith('_') && !paginationParams.includes(key) && !allowed.includes(key),
  );
  return unknown
    ? fapiError('form_param_unknown', {
        longMessage: `${unknown} is not a valid parameter for this request.`,
        paramName: unknown,
      })
    : undefined;
}
