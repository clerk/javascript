import type { OrganizationInvitationJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { fapiMembership } from '../fapi';
import { envelope, missing, rejectUnknownParams, requestUser } from './shared';

const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'];
const MEMBERSHIP_REQUEST_STATUSES = ['pending', 'accepted', 'rejected'];
const MAX_BULK_SIZE = 50;
const INVITATION_PARAMS = ['email_address', 'role', 'notify'];

function clerkErrors(status: number, ...errors: Array<Record<string, unknown>>) {
  return HttpResponse.json({ errors }, { status });
}

async function createInvitations(
  state: FakeFapiState,
  organizationId: string,
  request: Request,
): Promise<OrganizationInvitationJSON[] | Response> {
  const body = new URLSearchParams(await request.text());
  const unknown = [...body.keys()].find(key => !key.startsWith('_') && !INVITATION_PARAMS.includes(key));
  if (unknown) {
    return clerkErrors(422, {
      code: 'form_param_unknown',
      message: `${unknown} is not a valid parameter for this request.`,
      meta: { param_name: unknown },
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
      return clerkErrors(422, {
        code: 'form_param_missing',
        message: `${name} must be included.`,
        meta: { param_name: name },
      });
    }
  }
  if (notify !== null && notify !== 'true' && notify !== 'false') {
    return clerkErrors(422, {
      code: 'form_param_format_invalid',
      message: 'notify must be a boolean.',
      meta: { param_name: 'notify' },
    });
  }
  const organization = state.memberships.find(item => item.organization.id === organizationId)?.organization;
  if (!organization) {
    return missing();
  }
  const invalid = emailAddresses.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (invalid.length > 0) {
    return clerkErrors(422, {
      code: 'form_param_format_invalid',
      message: 'invalid email addresses',
      long_message: `The following email addresses are invalid: ${invalid.join(', ')}`,
      meta: { param_name: 'email_address', email_addresses: invalid },
    });
  }
  if (emailAddresses.length > MAX_BULK_SIZE) {
    return clerkErrors(400, {
      code: 'bulk_size_exceeded',
      message: 'bulk size exceeded',
      long_message: `Parameters exceed the maximum allowed bulk processing size of ${MAX_BULK_SIZE}.`,
    });
  }
  const selectedRole = state.roles.find(item => item.key === role);
  if (!selectedRole) {
    return clerkErrors(404, {
      code: 'resource_not_found',
      message: 'not found',
      long_message: 'Organization role not found',
      meta: { param_name: 'role' },
    });
  }
  const inviter = requestUser(state, request)?.organization_memberships?.find(
    item => item.organization.id === organizationId,
  );
  if (!inviter) {
    return clerkErrors(403, {
      code: 'not_a_member_in_organization',
      message: 'not a member',
      long_message:
        'Current user is not a member of the organization. Only organization members can perform this action.',
    });
  }
  if (!inviter.permissions.includes('org:sys_memberships:manage')) {
    return clerkErrors(403, {
      code: 'missing_organization_permission',
      message: 'missing permission',
      long_message: 'Current user is missing an organization permission.',
      meta: { permissions: ['org:sys_memberships:manage'] },
    });
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
    return clerkErrors(400, {
      code: 'already_a_member_in_organization',
      message: 'already a member',
      long_message: `${member} is already a member of the organization.`,
    });
  }
  const maxAllowed = organization.max_allowed_memberships;
  if (maxAllowed > 0 && members.length + pending.length + (normalized.length - replaced.length) > maxAllowed) {
    return clerkErrors(403, {
      code: 'organization_membership_quota_exceeded',
      message: 'organization membership quota exceeded',
      long_message: `You have reached your limit of ${maxAllowed} organization memberships, including outstanding invitations.`,
    });
  }
  const now = Date.now();
  const created = normalized.map(
    (email, index): OrganizationInvitationJSON => ({
      object: 'organization_invitation',
      id: `orginv_${now}_${state.organizationInvitations.length + index}`,
      email_address: email,
      organization_id: organizationId,
      public_metadata: {},
      status: 'pending',
      role: selectedRole.key,
      role_name: selectedRole.name,
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
    http.get(fapiUrl('/v1/organizations/:organizationId/membership_requests'), ({ params, request }) => {
      const url = new URL(request.url);
      const rejected = rejectUnknownParams(url, ['status']);
      if (rejected) {
        return rejected;
      }
      const statuses = url.searchParams.getAll('status').flatMap(status => status.split(','));
      const invalidStatus = statuses.find(status => !MEMBERSHIP_REQUEST_STATUSES.includes(status));
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
      const matching = state.organizationMembershipRequests.filter(
        item =>
          item.organization_id === params.organizationId && (statuses.length === 0 || statuses.includes(item.status)),
      );
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return envelope({ data: matching.slice(offset, offset + limit), total_count: matching.length }, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/membership_requests/:requestId/accept'), ({ params }) => {
      const request = state.organizationMembershipRequests.find(
        item =>
          item.organization_id === params.organizationId && item.id === params.requestId && item.status === 'pending',
      );
      const organization = state.memberships.find(item => item.organization.id === params.organizationId)?.organization;
      if (!request || !organization) {
        return missing();
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
      return envelope(accepted, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/membership_requests/:requestId/reject'), ({ params }) => {
      const request = state.organizationMembershipRequests.find(
        item =>
          item.organization_id === params.organizationId && item.id === params.requestId && item.status === 'pending',
      );
      if (!request) {
        return missing();
      }
      const rejected = { ...request, status: 'rejected' as const };
      state.organizationMembershipRequests = state.organizationMembershipRequests.map(item =>
        item.id === rejected.id ? rejected : item,
      );
      return envelope(rejected, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations'), async ({ params, request }) => {
      const created = await createInvitations(state, String(params.organizationId), request);
      return created instanceof Response ? created : envelope(created[0] ?? null, null);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/invitations/bulk'), async ({ params, request }) => {
      const created = await createInvitations(state, String(params.organizationId), request);
      return created instanceof Response ? created : envelope(created, null);
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
