import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { envelope, missing } from './shared';

export function organizationMemberHandlers(state: FakeFapiState, fapiUrl: (path: string) => string) {
  return [
    http.get(fapiUrl('/v1/organizations/:organizationId/memberships'), ({ params, request }) => {
      const url = new URL(request.url);
      const query = url.searchParams.get('query')?.toLowerCase();
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
