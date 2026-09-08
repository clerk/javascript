import {
  nativeResourceRoutes,
  type NativeRetainedResource,
} from '@clerk/shared/internal/clerk-js/nativeResourceRoutes';

import type { Clerk } from '../core/clerk';
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
} from '../core/resources/internal';
import { failure } from './errors';
import type { EmbeddedReceiver } from './invocation';

// The mapped type requires a runtime constructor for every retained route.
const retainedResourceTypes = {
  OrganizationResource: Organization,
  OrganizationDomainResource: OrganizationDomain,
  OrganizationInvitationResource: OrganizationInvitation,
  OrganizationMembershipResource: OrganizationMembership,
  OrganizationMembershipRequestResource: OrganizationMembershipRequest,
  OrganizationSuggestionResource: OrganizationSuggestion,
  SessionWithActivitiesResource: SessionWithActivities,
  UserOrganizationInvitationResource: UserOrganizationInvitation,
  BillingPaymentMethodResource: BillingPaymentMethod,
  BillingCheckoutResource: BillingCheckout,
  BillingSubscriptionItemResource: BillingSubscriptionItem,
} satisfies Record<NativeRetainedResource, { prototype: object }>;

const retainedTypes = Object.entries(retainedResourceTypes).map(([name, type]) => {
  const route = nativeResourceRoutes[name as NativeRetainedResource];
  return { type, kind: route.kind === 'listed' ? route.listedKind : route.kind };
});

export function createResourceRegistry(clerk: Clerk, onResource: (value: unknown) => void) {
  const registry = new Map<string, object>();

  function remember(value: object) {
    const id: unknown = Reflect.get(value, 'id');
    if (typeof id !== 'string') {
      return;
    }
    for (const { type, kind } of retainedTypes) {
      if (value instanceof type) {
        registry.set(`${kind}:${id}`, value);
        return;
      }
    }
  }

  function rememberTree(value: unknown, seen = new WeakSet<object>()) {
    if (!value || typeof value !== 'object' || value instanceof Date || seen.has(value)) {
      return;
    }
    seen.add(value);
    remember(value);
    onResource(value);
    for (const child of Object.values(value)) {
      rememberTree(child, seen);
    }
  }

  function serializeValue(value: unknown): unknown {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    if (Array.isArray(value)) {
      return value.map(serializeValue);
    }
    const snapshot: unknown = Reflect.get(value, '__internal_toSnapshot');
    if (typeof snapshot === 'function') {
      return Reflect.apply(snapshot, value, []);
    }
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, entry]) => key !== 'pathRoot' && typeof entry !== 'function')
        .map(([key, entry]) => [key, serializeValue(entry)]),
    );
  }

  async function resolve(receiver: EmbeddedReceiver, method: string): Promise<object | null | undefined> {
    switch (receiver.kind) {
      case 'clerk':
        return clerk;
      case 'signIn':
      case 'signUp':
      case 'user': {
        const resource = receiver.kind === 'user' ? clerk.user : clerk.client?.[receiver.kind];
        if (!resource || resource.id !== receiver.id) {
          failure(
            receiver.kind === 'user' ? 'stale_resource' : 'stale_authentication',
            'The resource snapshot is no longer current',
          );
        }
        return resource;
      }
      case 'billing':
        return clerk.billing;
      case 'userResource': {
        return clerk.user?.[receiver.collection]?.find(item => item.id === receiver.id);
      }
      case 'session': {
        const session = clerk.client?.sessions.find(item => item.id === receiver.id);
        if (session && typeof Reflect.get(session, method) === 'function') {
          return session;
        }
        let listed = registry.get(`${nativeResourceRoutes.SessionWithActivitiesResource.listedKind}:${receiver.id}`);
        if (!listed && clerk.user) {
          rememberTree(await clerk.user.getSessions());
          listed = registry.get(`${nativeResourceRoutes.SessionWithActivitiesResource.listedKind}:${receiver.id}`);
        }
        return listed;
      }
      case 'organization':
        return (
          clerk.user?.organizationMemberships.find(m => m.organization.id === receiver.id)?.organization ||
          registry.get(`${nativeResourceRoutes.OrganizationResource.kind}:${receiver.id}`) ||
          (await clerk.getOrganization(receiver.id))
        );
      case 'listed':
        return registry.get(`${receiver.listedKind}:${receiver.id}`);
    }
  }

  return {
    serialize: (value: unknown) => {
      rememberTree(value);
      return serializeValue(value);
    },
    resolve,
    clear: () => registry.clear(),
    forget: (receiver: EmbeddedReceiver) => {
      if (receiver.kind === 'listed') {
        registry.delete(`${receiver.listedKind}:${receiver.id}`);
      } else if (receiver.kind === 'organization') {
        registry.delete(`${nativeResourceRoutes.OrganizationResource.kind}:${receiver.id}`);
      } else if (receiver.kind === 'session') {
        registry.delete(`${nativeResourceRoutes.SessionWithActivitiesResource.listedKind}:${receiver.id}`);
      }
    },
  };
}
