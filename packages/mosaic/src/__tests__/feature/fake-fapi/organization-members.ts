import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { envelope, missing, rejectUnknownParams } from './shared';

const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'];

export function organizationMemberHandlers(state: FakeFapiState, fapiUrl: (path: string) => string) {
  return [
    http.get(fapiUrl('/v1/organizations/:organizationId/memberships'), ({ params, request }) => {
      const url = new URL(request.url);
      const rejected = rejectUnknownParams(url, ['query', 'role']);
      if (rejected) {
        return rejected;
      }
      const query = url.searchParams.get('query')?.toLowerCase();
      if (query === '') {
        return HttpResponse.json(
          { errors: [{ code: 'form_param_missing', message: 'Enter query.', meta: { param_name: 'query' } }] },
          { status: 422 },
        );
      }
      const matching = state.memberships.filter(member => {
        if (member.organization.id !== params.organizationId) {
          return false;
        }
        if (!query) {
          return true;
        }
        const user = member.public_user_data;
        return [user?.first_name, user?.last_name, user?.identifier].some(value =>
          value?.toLowerCase().includes(query),
        );
      });
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, null);
    }),
    http.get(fapiUrl('/v1/organizations/:organizationId/roles'), ({ params }) => {
      const organizationExists = state.memberships.some(member => member.organization.id === params.organizationId);
      return organizationExists
        ? envelope(
            { data: state.roles, total_count: state.roles.length, has_role_set_migration: state.hasRoleSetMigration },
            null,
          )
        : missing();
    }),
    http.get(fapiUrl('/v1/organizations/:organizationId/invitations'), ({ params, request }) => {
      const url = new URL(request.url);
      const rejected = rejectUnknownParams(url, ['status']);
      if (rejected) {
        return rejected;
      }
      const statuses = url.searchParams.getAll('status');
      const invalidStatus = statuses.find(status => !INVITATION_STATUSES.includes(status));
      if (invalidStatus) {
        return HttpResponse.json(
          {
            errors: [
              {
                code: 'form_param_value_invalid',
                message: `${invalidStatus} is not a valid value for status.`,
                meta: { param_name: 'status' },
              },
            ],
          },
          { status: 422 },
        );
      }
      const matching = state.organizationInvitations.filter(
        invitation =>
          invitation.organization_id === params.organizationId &&
          (statuses.length === 0 || statuses.includes(invitation.status)),
      );
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations/:invitationId/revoke'), ({ params }) => {
      const invitation = state.organizationInvitations.find(
        item => item.organization_id === params.organizationId && item.id === params.invitationId,
      );
      if (!invitation || invitation.status !== 'pending') {
        return HttpResponse.json(
          {
            errors: [
              {
                code: 'organization_invitation_not_pending',
                message: 'not pending',
                long_message: "The organization invitation is not in the 'pending' status.",
              },
            ],
          },
          { status: 404 },
        );
      }
      const revoked = { ...invitation, status: 'revoked' as const };
      state.organizationInvitations = state.organizationInvitations.map(item =>
        item.id === revoked.id ? revoked : item,
      );
      return envelope(revoked, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/memberships/:userId'), async ({ params, request }) => {
      const member = state.memberships.find(
        item => item.organization.id === params.organizationId && item.public_user_data?.user_id === params.userId,
      );
      if (!member) {
        return missing();
      }
      const method = new URL(request.url).searchParams.get('_method');
      if (method === 'DELETE') {
        state.memberships = state.memberships.filter(item => item.id !== member.id);
        return envelope(member, null);
      }
      if (method !== 'PATCH') {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const role = body.get('role');
      if (!role) {
        return HttpResponse.json(
          { errors: [{ code: 'form_param_missing', message: 'Role is required' }] },
          { status: 422 },
        );
      }
      const selected = state.roles.find(item => item.key === role);
      const updated = { ...member, role, role_name: selected?.name ?? role };
      state.memberships = state.memberships.map(item => (item.id === member.id ? updated : item));
      return envelope(updated, null);
    }),
  ];
}
