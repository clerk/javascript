import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { fapiMembership, type FapiOrganizationInvitation, fapiOrganizationInvitation } from '../fapi';
import { fapiError, fapiErrorJSON, fapiErrorStatus } from './errors';
import { envelope, rejectUnknownParams, requestUser, servedClient } from './shared';

const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'];
const MEMBERSHIP_REQUEST_STATUSES = ['pending', 'accepted', 'rejected'];
const MAX_BULK_SIZE = 50;
const INVITATION_PARAMS = ['email_address', 'role', 'notify'];

async function createInvitations(
  state: FakeFapiState,
  organizationId: string,
  request: Request,
): Promise<FapiOrganizationInvitation[] | Response> {
  const body = new URLSearchParams(await request.text());
  const unknown = [...body.keys()].find(key => !key.startsWith('_') && !INVITATION_PARAMS.includes(key));
  if (unknown) {
    return fapiError('form_param_unknown', {
      longMessage: `${unknown} is not a valid parameter for this request.`,
      paramName: unknown,
    });
  }
  const emailAddresses = body.getAll('email_address');
  const role = body.get('role');
  const notify = body.get('notify');
  for (const [name, value] of [
    ['email_address', emailAddresses[0]],
    ['role', role],
  ] as const) {
    if (!value) {
      return fapiError('form_param_missing', { longMessage: `${name} must be included.`, paramName: name });
    }
  }
  if (notify !== null && notify !== 'true' && notify !== 'false') {
    return fapiError('form_param_format_invalid', { longMessage: 'notify must be a boolean.', paramName: 'notify' });
  }
  const organization = state.memberships.find(item => item.organization.id === organizationId)?.organization;
  if (!organization) {
    return fapiError('resource_not_found');
  }
  const invalid = emailAddresses.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (invalid.length > 0) {
    return fapiError('form_param_format_invalid', {
      longMessage: `The following email addresses are invalid: ${invalid.join(', ')}`,
      paramName: 'email_address',
      meta: { email_addresses: invalid },
    });
  }
  if (emailAddresses.length > MAX_BULK_SIZE) {
    return fapiError('bulk_size_exceeded', {
      longMessage: `Parameters exceed the maximum allowed bulk processing size of ${MAX_BULK_SIZE}.`,
    });
  }
  const selectedRole = state.roles.find(item => item.key === role);
  if (!selectedRole) {
    return fapiError('resource_not_found', { longMessage: 'Organization role not found', paramName: 'role' });
  }
  const user = requestUser(state, request);
  const inviter = user?.organization_memberships?.find(item => item.organization.id === organizationId);
  if (!inviter) {
    return fapiError('not_a_member_in_organization');
  }
  if (!inviter.permissions.includes('org:sys_memberships:manage')) {
    return fapiError('missing_organization_permission', { meta: { permissions: ['org:sys_memberships:manage'] } });
  }
  const pending = state.organizationInvitations.filter(
    item => item.organization_id === organizationId && item.status === 'pending',
  );
  const normalized = emailAddresses.map(email => email.toLowerCase());
  const replaced = pending.filter(item => normalized.includes(item.email_address.toLowerCase()));
  const members = state.memberships.filter(item => item.organization.id === organizationId);
  const member = normalized.find(email =>
    members.some(item => item.public_user_data?.identifier?.toLowerCase() === email),
  );
  if (member) {
    return fapiError('already_a_member_in_organization', {
      longMessage: `${member} is already a member of the organization.`,
    });
  }
  const maxAllowed = organization.max_allowed_memberships;
  if (maxAllowed > 0 && members.length + pending.length + (normalized.length - replaced.length) > maxAllowed) {
    return fapiError('organization_membership_quota_exceeded', {
      longMessage: `You have reached your limit of ${maxAllowed} organization memberships, including outstanding invitations.`,
    });
  }
  const now = Date.now();
  const created = normalized.map((email, index) =>
    fapiOrganizationInvitation({
      id: `orginv_${now}_${state.organizationInvitations.length + index}`,
      email_address: email,
      organization_id: organizationId,
      role: selectedRole.key,
      role_name: selectedRole.name,
      inviter_id: user?.id ?? null,
      created_at: now,
      updated_at: now,
    }),
  );
  state.organizationInvitations = [
    ...created,
    ...state.organizationInvitations.map(item =>
      replaced.includes(item) ? { ...item, status: 'revoked' as const } : item,
    ),
  ];
  return created;
}

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
        return fapiError('form_param_missing', { longMessage: 'query must be included.', paramName: 'query' });
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
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, state);
    }),
    http.get(fapiUrl('/v1/organizations/:organizationId/roles'), ({ params }) => {
      const organizationExists = state.memberships.some(member => member.organization.id === params.organizationId);
      return organizationExists
        ? envelope(
            { data: state.roles, total_count: state.roles.length, has_role_set_migration: state.hasRoleSetMigration },
            state,
          )
        : fapiError('resource_not_found');
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
        return fapiError('form_param_value_invalid', {
          longMessage: `${invalidStatus} does not match one of the allowed values for parameter status`,
          paramName: 'status',
        });
      }
      const matching = state.organizationInvitations.filter(
        invitation =>
          invitation.organization_id === params.organizationId &&
          (statuses.length === 0 || statuses.includes(invitation.status)),
      );
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, state);
    }),
    http.get(fapiUrl('/v1/organizations/:organizationId/membership_requests'), ({ params, request }) => {
      const url = new URL(request.url);
      const rejected = rejectUnknownParams(url, ['status']);
      if (rejected) {
        return rejected;
      }
      const statuses = url.searchParams.getAll('status').flatMap(status => status.split(','));
      const invalidStatus = statuses.find(status => !MEMBERSHIP_REQUEST_STATUSES.includes(status));
      if (invalidStatus) {
        return fapiError('form_param_value_invalid', {
          longMessage: `${invalidStatus} does not match one of the allowed values for parameter status`,
          paramName: 'status',
        });
      }
      const matching = state.organizationMembershipRequests.filter(
        item =>
          item.organization_id === params.organizationId && (statuses.length === 0 || statuses.includes(item.status)),
      );
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/membership_requests/:requestId/accept'), ({ params }) => {
      const request = state.organizationMembershipRequests.find(
        item =>
          item.organization_id === params.organizationId && item.id === params.requestId && item.status === 'pending',
      );
      const organization = state.memberships.find(item => item.organization.id === params.organizationId)?.organization;
      if (!request || !organization) {
        return fapiError('resource_not_found');
      }
      const accepted = { ...request, status: 'accepted' as const };
      state.organizationMembershipRequests = state.organizationMembershipRequests.map(item =>
        item.id === accepted.id ? accepted : item,
      );
      state.memberships.push(
        fapiMembership(organization, {
          id: `orgmem_${request.public_user_data.user_id}`,
          public_user_data: request.public_user_data,
        }),
      );
      return envelope(accepted, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/membership_requests/:requestId/reject'), ({ params }) => {
      const request = state.organizationMembershipRequests.find(
        item =>
          item.organization_id === params.organizationId && item.id === params.requestId && item.status === 'pending',
      );
      if (!request) {
        return fapiError('resource_not_found');
      }
      const rejected = { ...request, status: 'rejected' as const };
      state.organizationMembershipRequests = state.organizationMembershipRequests.map(item =>
        item.id === rejected.id ? rejected : item,
      );
      return envelope(rejected, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations'), async ({ params, request }) => {
      const created = await createInvitations(state, String(params.organizationId), request);
      return created instanceof Response ? created : envelope(created[0] ?? null, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations/bulk'), async ({ params, request }) => {
      const created = await createInvitations(state, String(params.organizationId), request);
      return created instanceof Response ? created : envelope(created, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations/:invitationId/revoke'), ({ params }) => {
      const invitation = state.organizationInvitations.find(
        item => item.organization_id === params.organizationId && item.id === params.invitationId,
      );
      if (!invitation || invitation.status !== 'pending') {
        return HttpResponse.json(
          {
            clerk_trace_id: 'trace_1',
            errors: [fapiErrorJSON('organization_invitation_not_pending')],
            meta: { client: servedClient(state) },
          },
          { status: fapiErrorStatus('organization_invitation_not_pending') },
        );
      }
      const revoked = { ...invitation, status: 'revoked' as const };
      state.organizationInvitations = state.organizationInvitations.map(item =>
        item.id === revoked.id ? revoked : item,
      );
      return envelope(revoked, state);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/memberships/:userId'), async ({ params, request }) => {
      const member = state.memberships.find(
        item => item.organization.id === params.organizationId && item.public_user_data?.user_id === params.userId,
      );
      if (!member) {
        return fapiError('resource_not_found');
      }
      const method = new URL(request.url).searchParams.get('_method');
      if (method === 'DELETE') {
        state.memberships = state.memberships.filter(item => item.id !== member.id);
        return envelope(member, state);
      }
      if (method !== 'PATCH') {
        return fapiError('resource_not_found');
      }
      const body = new URLSearchParams(await request.text());
      const role = body.get('role');
      if (!role) {
        return fapiError('form_param_missing', { longMessage: 'role must be included.', paramName: 'role' });
      }
      const selected = state.roles.find(item => item.key === role);
      const updated = { ...member, role, role_name: selected?.name ?? role };
      state.memberships = state.memberships.map(item => (item.id === member.id ? updated : item));
      return envelope(updated, state);
    }),
  ];
}
