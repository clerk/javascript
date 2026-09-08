import type * as JSON from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../../core/clerk';
import {
  BillingCheckout,
  BillingPaymentMethod,
  BillingSubscriptionItem,
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipRequest,
  OrganizationSuggestion,
  SessionWithActivities,
  UserOrganizationInvitation,
} from '../../core/resources/internal';
import { createOrganizationMembership } from '../../test/core-fixtures';
import { parseInvocation } from '../invocation';
import { createResourceRegistry } from '../resources';

const membershipJSON = {
  ...createOrganizationMembership({ id: 'org_context' }),
  public_user_data: {
    user_id: 'user_context',
    identifier: 'context@example.com',
    image_url: '',
    has_image: false,
    first_name: null,
    last_name: null,
  },
};
const common = { id: 'resource_1', created_at: 0, updated_at: 0, organization_id: 'org_context' };
const publicOrganization = { id: 'org_context', name: 'Context', slug: null, has_image: false, image_url: '' };

// Each case invokes the actual JS resource method and checks its contextual FAPI path.
const cases = [
  {
    kind: 'organizationDomain',
    resource: () => new OrganizationDomain(common as JSON.OrganizationDomainJSON),
    method: 'delete',
    path: '/organizations/org_context/domains/resource_1',
  },
  {
    kind: 'organizationInvitation',
    resource: () => new OrganizationInvitation(common as JSON.OrganizationInvitationJSON),
    method: 'revoke',
    path: '/organizations/org_context/invitations/resource_1/revoke',
  },
  {
    kind: 'organizationMembership',
    resource: () => new OrganizationMembership({ ...membershipJSON, id: 'resource_1' }),
    method: 'update',
    args: [{ role: 'org:member' }],
    path: '/organizations/org_context/memberships/user_context',
  },
  {
    kind: 'organizationMembershipRequest',
    resource: () => new OrganizationMembershipRequest(common as JSON.OrganizationMembershipRequestJSON),
    method: 'accept',
    path: '/organizations/org_context/membership_requests/resource_1/accept',
  },
  {
    kind: 'organizationSuggestion',
    resource: () =>
      new OrganizationSuggestion({
        ...common,
        public_organization_data: publicOrganization,
      } as JSON.OrganizationSuggestionJSON),
    method: 'accept',
    path: '/me/organization_suggestions/resource_1/accept',
  },
  {
    kind: 'userOrganizationInvitation',
    resource: () =>
      new UserOrganizationInvitation({
        ...common,
        public_organization_data: publicOrganization,
      } as JSON.UserOrganizationInvitationJSON),
    method: 'accept',
    path: '/me/organization_invitations/resource_1/accept',
  },
  {
    kind: 'sessionWithActivities',
    resource: () => new SessionWithActivities(common as JSON.SessionWithActivitiesJSON, '/me/sessions'),
    method: 'revoke',
    path: '/me/sessions/resource_1/revoke',
  },
  {
    kind: 'billingPaymentMethod',
    resource: () => new BillingPaymentMethod(common as JSON.BillingPaymentMethodJSON),
    method: 'remove',
    args: [{ orgId: 'org_context' }],
    path: '/organizations/org_context/billing/payment_methods/resource_1',
  },
  {
    kind: 'billingSubscriptionItem',
    resource: () => new BillingSubscriptionItem(common as JSON.BillingSubscriptionItemJSON),
    method: 'cancel',
    args: [{ orgId: 'org_context' }],
    path: '/organizations/org_context/billing/subscription_items/resource_1',
  },
  {
    kind: 'billingCheckout',
    resource: () => {
      const checkout = new BillingCheckout();
      checkout.id = 'resource_1';
      checkout.payer = { organizationId: 'org_context' } as JSON.BillingPayerResource;
      return checkout;
    },
    method: 'confirm',
    args: [{}],
    path: '/organizations/org_context/billing/checkouts/resource_1/confirm',
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('retained native resources', () => {
  it.each(cases)('preserves the receiver context for $kind after snapshot serialization', async entry => {
    const clerk = new Clerk('pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k');
    const registry = createResourceRegistry(clerk, () => undefined);
    const resource = entry.resource();
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () =>
        Promise.resolve({
          response: {
            ...common,
            organization: membershipJSON.organization,
            public_user_data: membershipJSON.public_user_data,
            public_organization_data: publicOrganization,
            totals: Object.fromEntries(['subtotal', 'tax_total', 'grand_total'].map(key => [key, { amount: 0 }])),
            payer: { organization_id: 'org_context' },
          },
        }),
    });
    vi.stubGlobal('fetch', fetch);
    registry.serialize({ data: [resource], total_count: 1 });
    const { invocation } = parseInvocation({
      receiver: { kind: 'listed', listedKind: entry.kind, id: resource.id },
      method: entry.method,
      arguments: entry.args,
    });
    const target = await registry.resolve(invocation.receiver, invocation.method);
    expect(target).toBeDefined();
    await Reflect.apply(Reflect.get(target!, entry.method), target, entry.args ?? []);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(new URL(fetch.mock.calls[0][0]).pathname).toBe(`/v1${entry.path}`);

    registry.forget(invocation.receiver);
    expect(await registry.resolve(invocation.receiver, entry.method)).toBeUndefined();
  });

  it('retains nested resources before a parent snapshot strips their methods', async () => {
    const clerk = new Clerk('pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k');
    const registry = createResourceRegistry(clerk, () => undefined);
    const membership = new OrganizationMembership(membershipJSON);
    const parent = {
      membership,
      __internal_toSnapshot: () => ({ membership: membership.__internal_toSnapshot() }),
    };
    registry.serialize(parent);
    expect(
      await registry.resolve({ kind: 'listed', listedKind: 'organizationMembership', id: membership.id }, 'update'),
    ).toBe(membership);
    expect(await registry.resolve({ kind: 'organization', id: 'org_context' }, 'update')).toBeInstanceOf(Organization);
    registry.clear();
    expect(
      await registry.resolve({ kind: 'listed', listedKind: 'organizationMembership', id: membership.id }, 'update'),
    ).toBeUndefined();
  });
});
