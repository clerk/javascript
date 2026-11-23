import type { OrganizationMembershipJSON, SSOBypassAllowlistUserJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { envelope, missing } from './shared';

export interface FakeSSOBypassState {
  enabled: boolean;
  users: SSOBypassAllowlistUserJSON[];
  rejections: Record<string, string>;
}

export function createSSOBypassState(seed: Partial<FakeSSOBypassState> = {}): FakeSSOBypassState {
  return { enabled: true, users: [], rejections: {}, ...seed };
}

export function fapiSSOBypassUser(membership: OrganizationMembershipJSON): SSOBypassAllowlistUserJSON {
  const user = membership.public_user_data;
  if (!user?.user_id) {
    throw new Error('fapiSSOBypassUser needs a membership with public_user_data.user_id');
  }
  return {
    object: 'sso_bypass_allowlist_user',
    user_id: user.user_id,
    public_user_data: user,
    created_at: 1_700_000_000_000,
    updated_at: 1_700_000_000_000,
  };
}

const notEnabled = () =>
  HttpResponse.json({ errors: [{ code: 'feature_not_enabled', message: 'Feature not enabled' }] }, { status: 403 });

export function organizationSecurityHandlers(state: FakeFapiState, fapiUrl: (path: string) => string) {
  const memberOf = (organizationId: unknown, userId: string) =>
    state.memberships.find(
      member => member.organization.id === organizationId && member.public_user_data?.user_id === userId,
    );

  const add = (organizationId: unknown, userId: string) => {
    const member = memberOf(organizationId, userId);
    if (!member) {
      return undefined;
    }
    const entry = fapiSSOBypassUser(member);
    state.ssoBypass.users = [...state.ssoBypass.users.filter(user => user.user_id !== userId), entry];
    return entry;
  };

  return [
    http.get(fapiUrl('/v1/organizations/:organizationId/enterprise_connections'), ({ params }) =>
      envelope(
        state.enterpriseConnections.filter(connection => connection.organization_id === params.organizationId),
        null,
      ),
    ),
    http.get(fapiUrl('/v1/organizations/:organizationId/sso_bypass_allowlist_users'), () =>
      state.ssoBypass.enabled ? envelope(state.ssoBypass.users, null) : notEnabled(),
    ),
    http.post(
      fapiUrl('/v1/organizations/:organizationId/sso_bypass_allowlist_users/bulk'),
      async ({ params, request }) => {
        const userIds = new URLSearchParams(await request.text()).getAll('user_id');
        const data: SSOBypassAllowlistUserJSON[] = [];
        const errors: { user_id: string; code: string }[] = [];
        for (const userId of userIds) {
          const rejection = state.ssoBypass.rejections[userId];
          const entry = rejection ? undefined : add(params.organizationId, userId);
          if (entry) {
            data.push(entry);
          } else {
            errors.push({ user_id: userId, code: rejection ?? 'resource_not_found' });
          }
        }
        return envelope({ data, errors }, null);
      },
    ),
    http.post(fapiUrl('/v1/organizations/:organizationId/sso_bypass_allowlist_users'), async ({ params, request }) => {
      const userId = new URLSearchParams(await request.text()).get('user_id') ?? '';
      const entry = add(params.organizationId, userId);
      return entry ? envelope(entry, null) : missing();
    }),
    http.post(
      fapiUrl('/v1/organizations/:organizationId/sso_bypass_allowlist_users/:userId'),
      ({ params, request }) => {
        if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
          return undefined;
        }
        const exists = state.ssoBypass.users.some(user => user.user_id === params.userId);
        if (!exists) {
          return missing();
        }
        state.ssoBypass.users = state.ssoBypass.users.filter(user => user.user_id !== params.userId);
        return envelope({ object: 'sso_bypass_allowlist_user', id: params.userId, deleted: true }, null);
      },
    ),
  ];
}
